import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = process.env.PORT || 3000;

// 🔗 Your backend services
const REACT_APP_URL = "https://wa-admin-minfotboll-test.azurewebsites.net";
const DOTNET_APP_URL = "https://mysoccertest.ontariosoccer.net";

// 🔎 Paths that should go to the React app
const reactPaths = [
  "users",
  "login",
  "verification",
  "api",
  "_next",
  "static",
  "sv",
  "en",
];

// 🔥 Proxy to React app
const proxyToReact = createProxyMiddleware({
  target: REACT_APP_URL,
  changeOrigin: true,
  xfwd: true, // <-- Forward client headers
  pathRewrite: (path) => path,
  logger: console,
  timeout: 30000, // 30s client timeout
  proxyTimeout: 30000, // 30s backend timeout
  onError(err, req, res) {
    console.error(`❌ Proxy error (React app):`, err.message);
    res.status(502).send("Proxy error connecting to React app.");
  },
  onProxyRes(proxyRes, req, res) {
    // Fix redirects if necessary
    if (
      proxyRes.statusCode >= 300 &&
      proxyRes.statusCode < 400 &&
      proxyRes.headers.location
    ) {
      if (proxyRes.headers.location.startsWith("/")) {
        proxyRes.headers.location = `http://${req.headers.host}${proxyRes.headers.location}`;
      }
    }
  },
});

// 🔥 Proxy to .NET app
const proxyToDotnet = createProxyMiddleware({
  target: DOTNET_APP_URL,
  changeOrigin: true,
  xfwd: true,
  pathRewrite: (path) => path,
  logger: console,
  timeout: 30000,
  proxyTimeout: 30000,
  onError(err, req, res) {
    console.error(`❌ Proxy error (.NET app):`, err.message);
    res.status(502).send("Proxy error connecting to .NET app.");
  },
});

// ✅ Health check before wildcard proxy
app.get("/", (req, res) => {
  res.send("🟢 Azure reverse proxy is running.");
});

// 🚀 Wildcard proxy logic
app.use("*", (req, res, next) => {
  const { pathname } = new URL(req.originalUrl, `http://${req.headers.host}`);
  const pathParts = pathname.split("/").filter(Boolean);
  const slug = pathParts[0] || "";

  const useReact = reactPaths.includes(slug);

  console.log(
    `➡️ Proxying "${req.originalUrl}" → ${
      useReact ? "🟢 React App" : "🔴 .NET App"
    }`
  );

  return useReact
    ? proxyToReact(req, res, next)
    : proxyToDotnet(req, res, next);
});

app.listen(port, () => {
  console.log(`✅ Proxy listening on port ${port}`);
});
