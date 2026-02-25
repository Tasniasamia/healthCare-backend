import PDFDocument from "pdfkit";
import type { Gender } from "../../../generated/prisma/enums";

interface PrescriptionPDFPayload {
  appointment: {
    id: string;
    patient: {
      name: string;
      age?: number | string | any;
      gender: string | Gender | undefined;
      email?: string;
    };
    doctor: {
      name: string;
      specialization?: string;
    };
    date: Date;
  };
  prescription: {
    instructions: string;
    followUpDate?: Date | string;
  };
}

export const generatePrescriptionPDF = async (
  payload: PrescriptionPDFPayload
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      // Collect chunks
      doc.on("data", (chunk) => buffers.push(chunk));

      // When PDF finished
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer); // ✅ শুধু buffer return
      });

      doc.on("error", (err) => reject(err));

      // -------- PDF Content --------
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("HealthCare Center", { align: "center" })
        .moveDown();

      doc.font("Helvetica").fontSize(12);
      doc.text(`Doctor: ${payload.appointment.doctor.name}`);
      doc.text(`Patient: ${payload.appointment.patient.name}`);
      doc.text(`Instructions: ${payload.prescription.instructions}`);

      if (payload.prescription.followUpDate) {
        const followUp =
          typeof payload.prescription.followUpDate === "string"
            ? payload.prescription.followUpDate
            : payload.prescription.followUpDate.toDateString();

        doc.text(`Follow Up: ${followUp}`);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};