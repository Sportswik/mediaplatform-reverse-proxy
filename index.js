const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3000;

// Replace with your actual app URLs
const REACT_APP_URL = "https://wa-admin-minfotboll-test.azurewebsites.net";
const DOTNET_APP_URL = "https://mysoccertest.ontariosoccer.net";

const reactPaths = ["users", "api", "_next", "static"]; // static for images, CSS, etc.

// Reverse proxy routing
app.use("*", (req, res, next) => {
  const fullPath = req.originalUrl || req.url;
  const pathParts = fullPath.split("/").filter(Boolean); // remove empty strings
  const slug = pathParts[0] || "";

  // If the first path segment matches one of the React paths, go to React app
  const target = reactPaths.includes(slug) ? REACT_APP_URL : DOTNET_APP_URL;

  console.log(`➡️  Proxying "${fullPath}" → ${target}`);

  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path, // preserve full path
  })(req, res, next);
});

// Optional: health check or welcome
app.get("/", (req, res) => {
  res.send("🟢 Azure reverse proxy running.");
});

app.listen(port, () => {
  console.log(`✅ Proxy running on http://localhost:${port}`);
});
