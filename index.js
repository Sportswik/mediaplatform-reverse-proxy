import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = process.env.PORT || 3000;

// 🔗 Your backend services
const REACT_APP_URL = "https://wa-admin-minfotboll-test.azurewebsites.net"; // React app URL (e.g., http://localhost:3001)
const DOTNET_APP_URL = "https://mysoccertest.ontariosoccer.net";

// 🔀 Proxy for React app at /new/*
app.use(
  "/new",
  createProxyMiddleware({
    target: REACT_APP_URL,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: (path) => "/new/" + path,
    logger: console,
  })
);

// 🔀 Default route: send all other requests to .NET app
app.use(
  "/",
  createProxyMiddleware({
    target: DOTNET_APP_URL,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: (path) => path,
    logger: console,
    onError(err, req, res) {
      console.error("❌ .NET app proxy error:", err.message);
      res.status(502).send("Proxy error connecting to .NET app.");
    },
  })
);

// Optional: health check
app.get("/health", (req, res) => {
  res.send("🟢 Express proxy is running.");
});

app.listen(port, () => {
  console.log(`✅ Proxy listening at http://localhost:${port}`);
});
