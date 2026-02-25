import type { JwtPayload } from "jsonwebtoken";
import type { ICreateReview } from "./review.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errorHelplers/appError";
import {
  AppointmentStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import status from "http-status";


const giveReview = async (user: JwtPayload, payload: ICreateReview) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email, isDeleted: false },
  });
  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload?.appointmentId },
  });

  if (appointment?.patientId !== patient?.id) {
    throw new AppError(404, "User not found as patient into appointment");
  }

  if (appointment?.doctorId !== payload?.doctorId) {
    throw new AppError(404, "Doctor not found into appointment");
  }

  if (
    appointment?.status !== AppointmentStatus.COMPLETED ||
    appointment?.paymentStatus !== PaymentStatus.PAID
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Appointment status have to be completed . Payment status have to be paid"
    );
  }
  const existingReview = await prisma.review.findFirst({
    where: { appointmentId: payload.appointmentId },
  });
  
  if (existingReview) {
    throw new AppError(status.BAD_REQUEST, "Review already given");
  }

  const result = await prisma.$transaction(async (tx) => {
    const createReview = await tx.review.create({ data: {...payload,patientId:patient?.id} });
    if (createReview?.id) {
      const findAllDoctorReview = await tx.review.aggregate({
        where: {
          doctorId: payload?.doctorId,
        },
        _avg: {
          rating: true,
        },
      });
      return await tx.doctor.update({
        where: { id: payload?.doctorId },
        data: { avaerageRating: findAllDoctorReview?._avg?.rating ?? 0 },
      });
    }
  });

  return result;
};

export const reviewService = { giveReview };
