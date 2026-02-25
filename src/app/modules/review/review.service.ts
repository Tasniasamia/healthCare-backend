import type { JwtPayload } from "jsonwebtoken";
import type { ICreateReview, IUpdateReview } from "./review.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errorHelplers/appError";
import {
  AppointmentStatus,
  PaymentStatus,
  Role,
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
    const createReview = await tx.review.create({
      data: { ...payload, patientId: patient?.id },
    });
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
const updateReview = async (
  id: string,
  user: JwtPayload,
  payload: IUpdateReview
) => {
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

  const existingReview = await prisma.review.findFirst({
    where: { appointmentId: payload.appointmentId, id: id },
  });

  if (!existingReview) {
    throw new AppError(status.BAD_REQUEST, "Review not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateReview = await tx.review.update({
      where: { id: id },
      data: { ...payload },
    });
    if (updateReview?.id) {
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

const deleteReview = async (id: string, user: JwtPayload) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { email: user?.email, isDeleted: false },
  });
  const existingReview = await prisma.review.findUnique({
    where: { id: id },
  });

  if (!existingReview) {
    throw new AppError(status.BAD_REQUEST, "Review not found");
  }
  const result = await prisma.$transaction(async (tx) => {
    const deleteReview = await tx.review.delete({ where: { id: id } });
    if (deleteReview) {
      const findAllDoctorReview = await tx.review.aggregate({
        where: { doctorId: existingReview?.doctorId },
        _avg: { rating: true },
      });
      return await tx.doctor.update({
        where: { id: existingReview?.doctorId },
        data: { avaerageRating: findAllDoctorReview?._avg?.rating ?? 0 },
      });
    }
  });
  return result;
};

const getAllReviews = async (
) => {
    const reviews = await prisma.review.findMany({
        include: {
            doctor: true,
            patient: true,
            appointment: true
        }
    });

    return reviews;
};

const myReviews = async (user: JwtPayload) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email: user?.email
        }
    });
    if (!isUserExist) {
        throw new AppError(status.BAD_REQUEST, "Only patients can view their reviews");
    }

    if (isUserExist.role === Role.DOCTOR) {
     
        const doctorData=await prisma.doctor.findFirstOrThrow({
          where:{email:user?.email}
        })
        return await prisma.review.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                appointment: true
            }
        });
    }

    if (isUserExist.role === Role.PATIENT) {
        const patientData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: user?.email
            }
        });
        return await prisma.review.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                appointment: true
            }
        });
    }
}
export const reviewService = { giveReview, updateReview, deleteReview ,getAllReviews,myReviews};
