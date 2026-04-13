import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

function requestOnce(urlString, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    let u;
    try {
      u = new URL(urlString);
    } catch (e) {
      reject(e);
      return;
    }
    const isHttps = u.protocol === "https:";
    const lib = isHttps ? https : http;
    const port = u.port || (isHttps ? 443 : 80);
    const req = lib.request(
      {
        hostname: u.hostname,
        port,
        path: `${u.pathname}${u.search}`,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on("error", reject);
    if (body !== undefined && body !== null) {
      req.write(body);
    }
    req.end();
  });
}

export async function httpRequestBuffer(urlString, options = {}, maxRedirects = 10) {
  let current = urlString;
  let merged = { ...options, method: options.method || "GET" };
  for (let i = 0; i < maxRedirects; i += 1) {
    const res = await requestOnce(current, merged);
    const loc = res.headers.location;
    if (REDIRECT_CODES.has(res.statusCode) && loc) {
      current = new URL(String(loc), current).href;
      merged = {
        ...merged,
        method: res.statusCode === 303 ? "GET" : merged.method,
        body: undefined,
      };
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects");
}

export async function httpRequestText(urlString, { method = "GET", headers = {}, body } = {}, maxRedirects = 10) {
  let current = urlString;
  let merged = { method, headers: { ...headers }, body };
  for (let i = 0; i < maxRedirects; i += 1) {
    const res = await requestOnce(current, merged);
    const loc = res.headers.location;
    if (REDIRECT_CODES.has(res.statusCode) && loc) {
      current = new URL(String(loc), current).href;
      merged = {
        ...merged,
        method: res.statusCode === 303 ? "GET" : merged.method,
        body: undefined,
      };
      continue;
    }
    return { statusCode: res.statusCode, bodyText: res.body.toString("utf8") };
  }
  throw new Error("Too many redirects");
}
