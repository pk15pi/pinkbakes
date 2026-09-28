/**
 * PinkBakes Firebase Functions - Hosting proxies for SEO paths.
 *
 * /sitemap.xml cannot be a static file (product URLs are dynamic in Django).
 * Firebase Hosting rewrites do not proxy arbitrary external HTTPS URLs, so this
 * thin HTTPS function GETs ${API_ORIGIN}/sitemap.xml and returns the XML body.
 *
 * Required env (functions/.env for deploy, or Cloud Functions env config):
 *   API_ORIGIN=https://YOUR_DJANGO_API_HOST   (no trailing slash)
 *
 * Static public/robots.txt is kept on Hosting (same disallow + Sitemap URL).
 */
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

function apiOrigin() {
  return String(process.env.API_ORIGIN || "http://127.0.0.1:8000").replace(/\/$/, "");
}

/**
 * Proxy GET/HEAD to Django and return body with the given Content-Type.
 */
async function proxyFromDjango(req, res, upstreamPath, contentType) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.set("Allow", "GET, HEAD");
    return res.status(405).send("Method Not Allowed");
  }

  const url = `${apiOrigin()}${upstreamPath}`;
  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        Accept: contentType.split(";")[0].trim(),
        "User-Agent": "pinkbakes-firebase-seo-proxy/1.0",
      },
      redirect: "follow",
    });

    const body = await upstream.text();
    const upstreamType = upstream.headers.get("content-type");
    res.status(upstream.status);
    res.set("Content-Type", upstreamType || contentType);
    res.set("Cache-Control", "public, max-age=300");
    if (req.method === "HEAD") {
      return res.end();
    }
    return res.send(body);
  } catch (err) {
    console.error("seo proxy failed", { url, message: err && err.message });
    res.status(502);
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.set("Cache-Control", "no-store");
    return res.send("Bad Gateway: upstream SEO document unavailable");
  }
}

/** Hosting rewrite target: /sitemap.xml -> Django dynamic sitemap */
exports.sitemap = onRequest(
  {
    cors: false,
    invoker: "public",
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  (req, res) =>
    proxyFromDjango(req, res, "/sitemap.xml", "application/xml; charset=utf-8")
);