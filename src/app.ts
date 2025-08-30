import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app: express.Application = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: "http://localhost:3000", // your frontend origin
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, false);
      // Allow any localhost port
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);

// Error handling middleware
app.use(errorHandler);

export default app;
