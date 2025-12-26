const API_BASE = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "/api";

async function apiRequest(path, { method = "GET", body, signal, headers = {} } = {}) {
  const opts = {
    method,
    credentials: "include",
    headers: {
      ...headers,
    },
    signal,
  };

  if (body && !(body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body;
  }

  const res = await fetch(`${API_BASE}${path}`, opts);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  if (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")) return res.blob();
  return res.text();
}

export async function getJson(path, opts) {
  return apiRequest(path, { method: "GET", ...opts });
}

export async function postJson(path, body, opts) {
  return apiRequest(path, { method: "POST", body, ...opts });
}

export async function putJson(path, body, opts) {
  return apiRequest(path, { method: "PUT", body, ...opts });
}

export async function deleteJson(path, opts) {
  return apiRequest(path, { method: "DELETE", ...opts });
}

export async function postBlob(path, body, opts) {
  return apiRequest(path, { method: "POST", body, ...opts });
}

export default {
  getJson,
  postJson,
  putJson,
  deleteJson,
  postBlob,
};