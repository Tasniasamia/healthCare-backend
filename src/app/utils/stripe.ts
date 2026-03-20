import { stripe } from "../../config/stripe.config";
interface stripePayload {
  appointmentId: string;
  paymentId: string;
  customerName: string;
  price: number;
}

export const createCheckoutSession = async (payload: stripePayload) => {
  const session:any = await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with ${payload?.customerName}`,
          },
          unit_amount: payload?.price * 100,
          
        },
        quantity:1
      },
    ],
    metadata: {
      appointmentId: payload?.appointmentId,
      paymentId: payload?.paymentId,
    },
    success_url:
      `http://localhost:3000/payment/success`,

    cancel_url: "http://localhost:3000/payment/cancel",
  });

  return session;
};

export const paymentService = {
  createCheckoutSession,
};
