import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
