// import type { JwtPayload } from "jsonwebtoken";
// import type { ICreateprescription } from "./prescription.interface";
// import { prisma } from "../../lib/prisma";
// import {
//   AppointmentStatus,
//   PaymentStatus,
// } from "../../../generated/prisma/enums";
// import { convertPDFtoPNG, generatePrescriptionPDF } from "./prescription.utils";
// import { uploadFileToCloudinary, deleteFileFromCloudinary } from "../../../config/cloude.config";
// import { AppError } from "../../errorHelplers/appError";
// import status from "http-status";
// import { sendEmail } from "../../utils/email";

// const createPrescription = async (
//   user: JwtPayload,
//   payload: ICreateprescription
// ) => {
//     let fileName , uploadPdf ;
//   // 1️⃣ Check doctor
//   const isDoctorExist = await prisma.doctor.findFirstOrThrow({
//     where: { email: user?.email, isDeleted: false },
//   });

//   // 2️⃣ Check prescription already exists
//   const isAlreadyPrescriptionExist = await prisma.prescription.findUnique({
//     where: { appointmentId: payload?.appointmentId },
//   });
//   if (isAlreadyPrescriptionExist) {
//     throw new AppError(status.BAD_REQUEST, 'Prescription Already Exist');
//   }

//   // 3️⃣ Find appointment
//   const findAppointment = await prisma.appointment.findFirstOrThrow({
//     where: {
//       id: payload.appointmentId,
//       patientId: payload.patientId,
//       status: AppointmentStatus.COMPLETED,
//       paymentStatus: PaymentStatus.PAID,
//       doctorId: isDoctorExist.id,
//     },
//     include: {
//       patient: { include: { patientHealthData: true } },
//       doctor: { include: { specialities: true } },
//     },
//   });

//   // 4️⃣ Prepare followUpDate
//   let followUpDate: Date | string | any | undefined;
//   if (payload.followUpDate) {
//     followUpDate = new Date(payload.followUpDate);
//   }

//   // 5️⃣ Create prescription in DB (initially without pdfURL)
//   const prescription = await prisma.prescription.create({
//     data: {
//       followUpDate:followUpDate,
//       instructions: payload.instructions || "",
//       doctorId: findAppointment.doctorId,
//       appointmentId: findAppointment.id,
//       patientId: findAppointment.patientId,
//     },
//   });

//   try {
//     // 6️⃣ Generate PDF as Buffer
//     const pdfBuffer = await generatePrescriptionPDF({
//       appointment: {
//         id: findAppointment.id,
//         date: new Date(),
//         patient: {
//           name: findAppointment.patient.name,
//           age: findAppointment.patient.patientHealthData?.age,
//           gender: findAppointment.patient.patientHealthData?.gender,
//           email: findAppointment.patient.email,
//         },
//         doctor: {
//           name: findAppointment.doctor.name,
//           specialization: findAppointment.doctor.specialities.join(", "),
//         },
//       },
//       prescription: {
//         instructions: prescription.instructions,
//         followUpDate: prescription.followUpDate,
//       },
//     });

//     if (!pdfBuffer) return prescription;





//     const pngBuffer = await convertPDFtoPNG(pdfBuffer);
  
//   // এখন এই pngBuffer upload করো
//   fileName = `Patient-${findAppointment.patient.name}-${Date.now()}.png`;
//   uploadPdf = await uploadFileToCloudinary(pngBuffer, fileName);

// // // 7️⃣ Upload PDF to Cloudinary
//     //  fileName = `Patient-${findAppointment.patient.name}-${Date.now()}.png`;

//     //  uploadPdf = await uploadFileToCloudinary(pdfBuffer, fileName);


// console.log("uploadPdf",uploadPdf)
//     if (!uploadPdf?.url) throw new Error("Cloudinary upload failed");

//     // 8️⃣ Update prescription with pdfURL
//     const updatedPrescription = await prisma.prescription.update({
//       where: { id: prescription.id },
//       data: { pdfURL: uploadPdf.url },
//     });


//     // 9️⃣ Send Email
//     await sendEmail({
//       to: findAppointment.patient.email,
//       subject: "Prescription",
//       templateName: "prescriptionEmail",
//       templateData: {
//         appointment: {
//           id: findAppointment.id,
//           date: new Date(),
//           patient: {
//             name: findAppointment.patient.name,
//             age: findAppointment.patient.patientHealthData?.age,
//             gender: findAppointment.patient.patientHealthData?.gender,
//           },
//           doctor: {
//             name: findAppointment.doctor.name,
//             specialization: findAppointment.doctor.specialities.join(", "),
//           },
//         },
//         prescription: {
//           instructions: updatedPrescription.instructions,
//           followUpDate: updatedPrescription.followUpDate,
//         },
//         pdfUrl: uploadPdf.url,
//       },
//     });

//     return updatedPrescription;

//   } catch (error) {
//     await prisma.prescription.delete({ where: { id: prescription.id } });

//     if (fileName) {
//       try {
//         await deleteFileFromCloudinary(fileName);
//       } catch (cloudErr) {
//         console.error("Failed to delete uploaded PDF from Cloudinary", cloudErr);
//       }
//     }
  
//     throw new AppError(
//       status.INTERNAL_SERVER_ERROR,
//       "Failed to generate prescription"
//     );
//   }
// };

// export const prescriptionService = { createPrescription };


import type { JwtPayload } from "jsonwebtoken";
import type { ICreateprescription } from "./prescription.interface";
import { prisma } from "../../lib/prisma";
import {
  AppointmentStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import { generatePrescriptionImage } from "./prescription.utils";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../../../config/cloude.config";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";
import { sendEmail } from "../../utils/email";

const createPrescription = async (
  user: JwtPayload,
  payload: ICreateprescription
) => {
  let fileName, uploadResult;

  // 1️⃣ Check doctor
  const isDoctorExist = await prisma.doctor.findFirstOrThrow({
    where: { email: user?.email, isDeleted: false },
  });

  // 2️⃣ Check prescription already exists
  const isAlreadyPrescriptionExist = await prisma.prescription.findUnique({
    where: { appointmentId: payload?.appointmentId },
  });
  if (isAlreadyPrescriptionExist) {
    throw new AppError(status.BAD_REQUEST, "Prescription Already Exist");
  }

  // 3️⃣ Find appointment
  const findAppointment = await prisma.appointment.findFirstOrThrow({
    where: {
      id: payload.appointmentId,
      patientId: payload.patientId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      doctorId: isDoctorExist.id,
    },
    include: {
      patient: { include: { patientHealthData: true } },
      doctor: { include: { specialities: true } },
    },
  });

  // 4️⃣ Prepare followUpDate
  let followUpDate: Date | undefined | any;
  if (payload.followUpDate) {
    followUpDate = new Date(payload.followUpDate);
  }

  // 5️⃣ Create prescription in DB (initially without imageURL)
  const prescription = await prisma.prescription.create({
    data: {
      followUpDate: followUpDate,
      instructions: payload.instructions || "",
      doctorId: findAppointment.doctorId,
      appointmentId: findAppointment.id,
      patientId: findAppointment.patientId,
    },
  });

  try {
    // 6️⃣ Generate PNG image (puppeteer)
    const imageBuffer = await generatePrescriptionImage({
      appointment: {
        id: findAppointment.id,
        date: new Date(),
        patient: {
          name: findAppointment.patient.name,
          age: findAppointment.patient.patientHealthData?.age,
          gender: findAppointment.patient.patientHealthData?.gender,
          email: findAppointment.patient.email,
        },
        doctor: {
          name: findAppointment.doctor.name,
          specialization: findAppointment.doctor.specialities.join(", "),
        },
      },
      prescription: {
        instructions: prescription.instructions,
        followUpDate: prescription.followUpDate ?? undefined,
      },
    });

    if (!imageBuffer) return prescription;

    // 7️⃣ Upload PNG to Cloudinary
    fileName = `Patient-${findAppointment.patient.name}-${Date.now()}.png`;
    uploadResult = await uploadFileToCloudinary(imageBuffer, fileName);

    if (!uploadResult?.url) throw new Error("Cloudinary upload failed");

    // 8️⃣ Update prescription with image URL
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescription.id },
      data: { pdfURL: uploadResult.url },
    });

    // 9️⃣ Send Email
    await sendEmail({
      to: findAppointment.patient.email,
      subject: "Prescription",
      templateName: "prescriptionEmail",
      templateData: {
        appointment: {
          id: findAppointment.id,
          date: new Date(),
          patient: {
            name: findAppointment.patient.name,
            age: findAppointment.patient.patientHealthData?.age,
            gender: findAppointment.patient.patientHealthData?.gender,
          },
          doctor: {
            name: findAppointment.doctor.name,
            specialization: findAppointment.doctor.specialities.join(", "),
          },
        },
        prescription: {
          instructions: updatedPrescription.instructions,
          followUpDate: updatedPrescription.followUpDate,
        },
        pdfUrl: uploadResult.url,
      },
    });

    return updatedPrescription;
  } catch (error) {
    await prisma.prescription.delete({ where: { id: prescription.id } });

    if (uploadResult?.url) {
      try {
        await deleteFileFromCloudinary(uploadResult.url);
      } catch (cloudErr) {
        console.error("Failed to delete uploaded file from Cloudinary", cloudErr);
      }
    }

    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to generate prescription"
    );
  }
};

export const prescriptionService = { createPrescription };