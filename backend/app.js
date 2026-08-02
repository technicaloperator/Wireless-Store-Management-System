import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import config from "./config/index.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: config.allowedOrigins }));

app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "WSMS Backend Running",
  });
});

export default app;
