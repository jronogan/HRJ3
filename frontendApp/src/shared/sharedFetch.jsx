let refreshInFlight = null;

const sharedFetch = (options = {}) => {
  const { getRefreshToken, setAccessToken, onAuthError } = options;

  const refreshAccessToken = async () => {
    const refresh = getRefreshToken?.();
    if (!refresh) return { ok: false, msg: "Missing refresh token" };

    const res = await fetch(import.meta.env.VITE_SERVER + "/users/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const contentType = res.headers.get("content-type") || "";
    const data = await (async () => {
      if (!contentType.includes("application/json")) return await res.text();
      const text = await res.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    })();

    if (!res.ok) {
      const msg =
        (data && typeof data === "object" && (data.msg || data.message)) ||
        (typeof data === "string" ? data : null) ||
        `Refresh failed (${res.status})`;
      return { ok: false, msg, data };
    }

    const access =
      (data && typeof data === "object" && (data.access || data.accessToken)) ||
      null;
    if (!access) return { ok: false, msg: "Refresh succeeded but no access" };

    if (typeof setAccessToken === "function") setAccessToken(access);
    return { ok: true, access };
  };

  const shouldAttemptRefresh = (res, data) => {
    if (res.status !== 401) return false;
    if (typeof getRefreshToken !== "function") return false;
    if (!getRefreshToken?.()) return false;

    const msg =
      data && typeof data === "object"
        ? data.msg || data.message || data.error
        : typeof data === "string"
        ? data
        : "";

    const msgLower = String(msg || "").toLowerCase();
    return (
      msgLower.includes("expired") ||
      msgLower.includes("invalid") ||
      msgLower.includes("token") ||
      msgLower.includes("authorization")
    );
  };

  const fetchData = async (
    endpoint,
    method,
    body,
    token,
    _didRetry = false
  ) => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = "Bearer " + token;
      }

      const upperMethod = String(method || "GET").toUpperCase();
      const options = {
        method: upperMethod,
        headers,
      };

      if (upperMethod !== "GET" && upperMethod !== "HEAD") {
        options.body = JSON.stringify(body ?? {});
      }

      const res = await fetch(import.meta.env.VITE_SERVER + endpoint, options);
      const contentType = res.headers.get("content-type") || "";
      const data = await (async () => {
        if (!contentType.includes("application/json")) return await res.text();
        const text = await res.text();
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })();

      if (shouldAttemptRefresh(res, data) && !_didRetry) {
        try {
          if (!refreshInFlight) {
            refreshInFlight = refreshAccessToken().finally(() => {
              refreshInFlight = null;
            });
          }

          const refreshRes = await refreshInFlight;
          if (refreshRes.ok && refreshRes.access) {
            return await fetchData(
              endpoint,
              method,
              body,
              refreshRes.access,
              true
            );
          }

          if (typeof onAuthError === "function") {
            onAuthError(refreshRes.msg || "Failed to refresh token");
          }
        } catch (e) {
          if (typeof onAuthError === "function") {
            onAuthError(e?.message || "Failed to refresh token");
          }
        }
      }

      if (!res.ok) {
        // Common shapes:
        // - { msg: "..." }
        // - { msg: [{ msg: "..." }, ...] } (express-validator)
        // - { message: "..." }
        // - { error: "..." }
        // - string body
        if (data && typeof data === "object") {
          const msg =
            (Array.isArray(data.msg) && data.msg[0]?.msg) ||
            data.msg ||
            data.message ||
            data.error;
          if (msg) return { ok: false, msg };

          // Some APIs use express-validator style under `errors`
          const errorsMsg =
            (Array.isArray(data.errors) && data.errors[0]?.msg) ||
            (Array.isArray(data.errors) && data.errors[0]?.message);
          if (errorsMsg) return { ok: false, msg: errorsMsg, data };

          // If we got a structured error response, surface it for easier debugging.
          return { ok: false, msg: `Request failed (${res.status})`, data };
        }

        return {
          ok: false,
          msg:
            typeof data === "string" && data
              ? data
              : `Request failed (${res.status})`,
        };
      }

      return { ok: true, data };
    } catch (error) {
      console.error(error.message);
      return { ok: false, msg: error?.message || "data error" };
    }
  };

  return fetchData;
};

export default sharedFetch;
