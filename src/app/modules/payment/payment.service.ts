// src/app/modules/payment/payment.service.ts
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../../config/env";
import { AppointmentStatus, PaymentStatus } from "../../../generated/prisma/enums";
import Stripe from "stripe";
import { generatePrescriptionImage } from "../prescription/prescription.utils";
import { generatePaymentConfirmationImage } from "./payment.utils";
import { sendEmail } from "../../utils/email";
import { uploadFileToCloudinary } from "../../../config/cloude.config";

// Initialize Stripe
const stripe = new Stripe(envVars.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27" as any,
});

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  // 1️⃣ Get signature from headers
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // 2️⃣ Construct event using raw body
    // req.body MUST be raw (express.raw({type:'application/json'}))
    event = stripe.webhooks.constructEvent(req.body, sig, envVars.WEBHOOK_SIGNING_SECRET!);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 3️⃣ Prevent duplicate processing
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return res.json({ message: `Event ${event.id} already processed` });
  }

  // 4️⃣ Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return res.status(400).json({ message: "Missing appointmentId or paymentId" });
      }

      // 5️⃣ Update appointment & payment in a transaction
      // await prisma.$transaction(async (tx) => {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            status:AppointmentStatus.COMPLETED
          },
        });

      const paymentData=  await prisma.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session,
          },
          include:{
            appointment:{include:{patient:{include:{user:true,patientHealthData:true}},doctor:{include:{specialities:true,}}}}
          }
        });

    console.log("session.payment_status",session.payment_status);
    console.log("paymentData", paymentData);

        const imageBuffer = await generatePaymentConfirmationImage({
          // Patient
          patientName: paymentData?.appointment.patient?.user?.name as string,
          patientEmail: paymentData?.appointment.patient.email,
          patientAge: paymentData?.appointment.patient.patientHealthData?.age,
          patientGender: paymentData?.appointment.patient.patientHealthData?.gender as any,
        
          // Doctor
          doctorName: paymentData?.appointment.doctor.name,
          doctorSpecialization: paymentData?.appointment.doctor.specialities
            ?.map((s: any) => s.specialty.title) // ← DoctorSpecialty.specialty.title
            .join(", "),
          doctorFee: paymentData?.appointment.doctor.appointmentFee,
        
          // Payment
          amount: session.amount_total / 100,
          appointmentId: appointmentId,
          paymentId: paymentId,
          date: new Date().toDateString(),
        });
            // 7️⃣ Upload PNG to Cloudinary
    let fileName = `appointment-${paymentData?.appointment?.patient?.name}-${Date.now()}.png`;
    let uploadResult = await uploadFileToCloudinary(imageBuffer, fileName);

    if (!uploadResult?.secure_url) throw new Error("Cloudinary upload failed");

    const updatePayment = await prisma.payment.update({
      where: { id: paymentData?.id },
      data: { invoiceUrl: uploadResult.secure_url },
    });

    await sendEmail({
      to: paymentData?.appointment.patient.email,
      subject: "Payment Confirmation - HealthCare Center",
      templateName: "paymentConfirmationEmail", // ← এই নামে file save করো
      templateData: {
        patientName: paymentData?.appointment?.patient?.name,
        patientEmail: paymentData?.appointment?.patient?.email,
        patientAge: paymentData?.appointment?.patient?.patientHealthData?.age,
        patientGender: paymentData?.appointment?.patient?.patientHealthData?.gender,
        doctorName: paymentData?.appointment?.doctor?.name,
        doctorSpecialization: paymentData?.appointment?.doctor?.specialities
          ?.map((s: any) => s.specialty.title).join(", "),
        doctorFee: paymentData?.appointment?.doctor?.appointmentFee,
        amount: session.amount_total / 100,
        appointmentId,
        paymentId,
        date: new Date().toDateString(),
        imageUrl: uploadResult.secure_url, // ← cloudinary url
      },
    });
      // });

      console.log(`Processed checkout.session.completed for appointment ${appointmentId}`);
      break;
    }

    case "payment_intent.canceled":
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as any;
      console.log(`Payment intent ${paymentIntent.id} ${event.type.replace("payment_intent.", "")}`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // 6️⃣ Respond to Stripe
  res.json({ received: true, message: `Webhook event ${event.id} processed` });
};



export const paymentService = {
  handleStripeWebhookEvent
};