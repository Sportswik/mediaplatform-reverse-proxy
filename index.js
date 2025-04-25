import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = process.env.PORT || 3000;

const REACT_APP_URL = "https://wa-admin-minfotboll-test.azurewebsites.net";
const DOTNET_APP_URL = "https://mysoccertest.ontariosoccer.net";

// First path segments that should go to the React app
const reactPaths = ["users", "login", "verification", "api", "_next", "static"];

// Middleware to route requests to appropriate target
app.use("*", (req, res, next) => {
  const fullPath = req.originalUrl || req.url;
  const pathParts = fullPath.split("/").filter(Boolean);
  const slug = pathParts[0] || "";

  const target = reactPaths.includes(slug) ? REACT_APP_URL : DOTNET_APP_URL;

  console.log(`➡️ Proxying "${fullPath}" → ${target}`);

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path, // keep full path
  })(req, res, next);
});

// health check
app.get("/", (req, res) => {
  res.send("🟢 Azure reverse proxy is running.");
});

app.listen(port, () => {
  console.log(`✅ Proxy listening on port ${port}`);
});
