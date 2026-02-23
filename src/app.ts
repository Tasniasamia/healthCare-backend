import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import route from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { NotfoundHandler } from "./app/middleware/notFoundHandler";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { PaymentController } from "./app/modules/payment/payment.controller";
import cron from "node-cron";
import { appointmentService } from "./app/modules/appointment/appointment.service";

const app: Application = express();
app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // <-- MUST
  PaymentController.handleStripeWebhookEvent
);
// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS
const allowedOrigins = [
  process.env.APP_URL,
  process.env.PROD_APP_URL,
  "http://localhost:3000",
  "http://localhost:5050",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) callback(null, true);
      else callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  })
);

// Auth
app.all("/api/auth/*splat", toNodeHandler(auth));

// Routes
app.use("/api/v1", route);

// Stripe webhook → must use raw body!

// Global error handlers
app.use(globalErrorHandler);
app.use(NotfoundHandler);

// Test root
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// Cron job: cancel unpaid appointments every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  await appointmentService.cancelUnpaidAppointments();
  console.log("Cron: canceled unpaid appointments if any");
});

export default app;