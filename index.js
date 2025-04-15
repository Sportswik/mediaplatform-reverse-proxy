const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = 3000;

// Define which first path segment maps to which app
const routeMap = {
  contact: "http://localhost:3002", // App 2
  // everything else → App 1
};

const defaultTarget = "http://localhost:3001"; // App 1

// Root path (optional)
app.get("/", (req, res) => {
  res.send("Reverse proxy running on http://localhost:3000");
});

// Proxy everything else
app.use("*", (req, res, next) => {
  const fullPath = req.originalUrl || req.url; // full URL path
  const pathParts = fullPath.split("/").filter(Boolean); // remove empty parts

  const slug = pathParts[0] || ""; // First path segment (or empty string)
  const target = routeMap[slug] || defaultTarget;

  console.log(`➡️  Routing "${fullPath}" to ${target}`);

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => path, // keep path as-is
  })(req, res, next);
});

app.listen(port, () => {
  console.log(`✅ Proxy listening on http://localhost:${port}`);
});
