// import PDFDocument from "pdfkit";
// import type { Gender } from "../../../generated/prisma/enums";
// import sharp from "sharp";

// interface PrescriptionPDFPayload {
//   appointment: {
//     id: string;
//     patient: {
//       name: string;
//       age?: number | string | any;
//       gender: string | Gender | undefined;
//       email?: string;
//     };
//     doctor: {
//       name: string;
//       specialization?: string;
//     };
//     date: Date;
//   };
//   prescription: {
//     instructions: string;
//     followUpDate?: Date | string;
//   };
// }

// export const generatePrescriptionPDF = async (
//   payload: PrescriptionPDFPayload
// ): Promise<Buffer> => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument({ margin: 50 });
//       const buffers: Buffer[] = [];

//       // Collect chunks
//       doc.on("data", (chunk) => buffers.push(chunk));

//       // When PDF finished
//       doc.on("end", () => {
//         const pdfBuffer = Buffer.concat(buffers);
//         resolve(pdfBuffer); // ✅ শুধু buffer return
//       });

//       doc.on("error", (err) => reject(err));

//       // -------- PDF Content --------
//       doc
//         .font("Helvetica-Bold")
//         .fontSize(20)
//         .text("HealthCare Center", { align: "center" })
//         .moveDown();

//       doc.font("Helvetica").fontSize(12);
//       doc.text(`Doctor: ${payload.appointment.doctor.name}`);
//       doc.text(`Patient: ${payload.appointment.patient.name}`);
//       doc.text(`Instructions: ${payload.prescription.instructions}`);

//       if (payload.prescription.followUpDate) {
//         const followUp =
//           typeof payload.prescription.followUpDate === "string"
//             ? payload.prescription.followUpDate
//             : payload.prescription.followUpDate.toDateString();

//         doc.text(`Follow Up: ${followUp}`);
//       }

//       doc.end();
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// export const convertPDFtoPNG=async(pdfBuffer:Buffer)=>{
//   return await sharp(pdfBuffer, { density: 150 })
//   .png()
//   .toBuffer();
// }

import puppeteer from "puppeteer";
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

export const generatePrescriptionImage = async (
  payload: PrescriptionPDFPayload
): Promise<Buffer> => {
  const followUp = payload.prescription.followUpDate
    ? typeof payload.prescription.followUpDate === "string"
      ? payload.prescription.followUpDate
      : payload.prescription.followUpDate.toDateString()
    : "N/A";

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #fff;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            color: #0066cc;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section h2 {
            font-size: 16px;
            color: #0066cc;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
            color: #555;
          }
          .info-value {
            color: #333;
          }
          .instructions-box {
            background: #f9f9f9;
            border-left: 4px solid #0066cc;
            padding: 15px;
            font-size: 14px;
            line-height: 1.6;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 HealthCare Center</h1>
          <p>Official Prescription Document</p>
          <p>Date: ${payload.appointment.date.toDateString()}</p>
        </div>

        <div class="section">
          <h2>Doctor Information</h2>
          <div class="info-row">
            <span class="info-label">Doctor Name:</span>
            <span class="info-value">${payload.appointment.doctor.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Specialization:</span>
            <span class="info-value">${payload.appointment.doctor.specialization || "N/A"}</span>
          </div>
        </div>

        <div class="section">
          <h2>Patient Information</h2>
          <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-value">${payload.appointment.patient.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Age:</span>
            <span class="info-value">${payload.appointment.patient.age || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Gender:</span>
            <span class="info-value">${payload.appointment.patient.gender || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${payload.appointment.patient.email || "N/A"}</span>
          </div>
        </div>

        <div class="section">
          <h2>Prescription Details</h2>
          <div class="instructions-box">
            ${payload.prescription.instructions}
          </div>
        </div>

        <div class="section">
          <h2>Follow Up</h2>
          <div class="info-row">
            <span class="info-label">Follow Up Date:</span>
            <span class="info-value">${followUp}</span>
          </div>
        </div>

        <div class="footer">
          <p>Appointment ID: ${payload.appointment.id}</p>
          <p>This is a computer-generated prescription.</p>
        </div>
      </body>
    </html>
  `);

  const buffer = await page.screenshot({ type: "png", fullPage: true });
  await browser.close();

  return buffer as Buffer;
};