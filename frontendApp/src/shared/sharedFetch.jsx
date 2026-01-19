const sharedFetch = () => {
  const fetchData = async (endpoint, method, body, token) => {
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
