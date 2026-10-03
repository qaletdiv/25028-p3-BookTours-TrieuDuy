import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import toursRouter from "./routes/tours.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "BookTours API đang hoạt động." });
});
app.use("/api/tours", toursRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Không tìm thấy API." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Hệ thống đang bận, vui lòng thử lại."
        : error.message,
  });
});

export default app;
