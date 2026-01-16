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
      const data = await res.json();

      if (!res.ok) {
        if (data?.msg) {
          if (Array.isArray(data.msg)) {
            console.error("Array(data.msg)", data.msg[0].msg);
            return { ok: false, msg: data.msg[0].msg };
          } else {
            console.error("data.msg", data.msg);
            return { ok: false, msg: data.msg };
          }
        } else {
          console.error("final", data);
          return {
            ok: false,
            msg: "an unknown error has occurred, please try again later",
          };
        }
      }

      return { ok: true, data: data };
    } catch (error) {
      console.error(error.message);
      return { ok: false, msg: "data error" };
    }
  };

  return fetchData;
};

export default sharedFetch;
