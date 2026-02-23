import type { Request, Response } from "express";
import { catchAsyncHandler } from "../../shared/catchAsyncHandler";
import { paymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.handleStripeWebhookEvent(req, res);
    res.json({ received: true, data: result });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
};