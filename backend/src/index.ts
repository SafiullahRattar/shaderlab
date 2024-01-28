import express from "express";
import cors from "cors";
import shaderRoutes from "./routes/shaders";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/shaders", shaderRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ShaderLab API running on port ${PORT}`);
});

export default app;
