import type { JwtPayload } from "jsonwebtoken";
import type { IUpdatePatientProfile } from "./patient.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errorHelplers/appError";
import { deleteFileFromCloudinary } from "../../../config/cloude.config";
import { convertToDateTime } from "./patient.utils";

const updatePatientProfile = async (
  authUser: JwtPayload,
  payload: IUpdatePatientProfile
) => {
  const { user, patientInfo, patientHealth, medicalReports } = payload;
  const { patientId, ...healthData } = patientHealth;

  const isUserExist = await prisma?.user?.findUniqueOrThrow({
    where: { email: authUser?.email, isDeleted: false },
  });

  const isPatientExist = await prisma.patient.findUniqueOrThrow({
    where: { email: authUser?.email, isDeleted: false },
  });

  if (!isUserExist || !isPatientExist) {
    throw new AppError(404, "User not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updateUser = await tx.user.update({
      where: { id: isUserExist?.id },
      data: { ...user },
    });
    if (updateUser) {
      const updatePatient = await tx.patient.update({
        where: { id: isPatientExist?.id },
        data: { ...patientInfo },
      });
      if (updatePatient) {
        if (payload?.patientHealth?.dateOfBirth) {
          healthData.dateOfBirth = convertToDateTime(
            typeof healthData.dateOfBirth === "string"
              ? healthData.dateOfBirth
              : "undefined"
          ) as any;
        }

        const updatePatientHealth = await tx.patientHealthData.upsert({
          where: { patientId: updatePatient.id },
          update: {
            ...healthData,
          },
          create: {
            ...healthData,
            patientId: updatePatient?.id,
          },
        });

        if (medicalReports && medicalReports?.length > 0) {
          const reportsToDelete = medicalReports.filter((r) => r?.shouldDelete);
          for (const report of reportsToDelete) {
            if (report?.reportId) {
              const deletedReport = await tx.medicalReport.delete({
                where: { id: report.reportId },
              });
              if (deletedReport?.reportLink) {
                await deleteFileFromCloudinary(deletedReport?.reportLink);
              }
            }
          }

          const reportsToCreate = medicalReports
            .filter((r) => !r?.shouldDelete)
            .map((r) => ({
              reportLink: r?.reportLink as string,
              reportName: r?.reportName as string,
              patientId: updatePatient.id,
            }));

          if (reportsToCreate.length) {
            await tx.medicalReport.createMany({
              data: reportsToCreate,
            });
          }
        }

        const updatedMedicalReports = await tx.medicalReport.findMany({
          where: { patientId: updatePatient?.id },
        });
        return {
          user: updateUser,
          patient: updatePatient,
          patientHealth: updatePatientHealth,
          medicalReports: updatedMedicalReports || [],
        };
      }
    }
  });

  return result;
};

export const patientService = {
  updatePatientProfile,
};
