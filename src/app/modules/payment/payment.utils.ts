import puppeteer from "puppeteer";

export const generatePaymentConfirmationImage = async (data: {
    patientName: string | any;
    patientEmail: string | any;
    patientAge?: number | string | any;
    patientGender: string;
    doctorName: string;
    doctorSpecialization?: string;
    doctorFee: number;
    amount: number;
    appointmentId: string;
    paymentId: string;
    date: string;
  }): Promise<Buffer> => {
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
              background: #f0f4f8;
              padding: 30px;
            }
            .card {
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              max-width: 700px;
              margin: 0 auto;
            }
  
            /* ── Header ── */
            .header {
              background: linear-gradient(135deg, #0066cc, #004499);
              color: white;
              text-align: center;
              padding: 32px 20px 24px;
            }
            .header h1 { font-size: 26px; letter-spacing: 1px; }
            .header p  { font-size: 13px; opacity: 0.8; margin-top: 4px; }
            .badge {
              display: inline-block;
              background: #4caf50;
              color: white;
              padding: 6px 20px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
              margin-top: 12px;
            }
            .date {
              font-size: 12px;
              opacity: 0.75;
              margin-top: 8px;
            }
  
            /* ── Sections ── */
            .body { padding: 28px 32px; }
  
            .section { margin-bottom: 24px; }
  
            .section-title {
              font-size: 13px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #0066cc;
              background: #f0f7ff;
              border-left: 4px solid #0066cc;
              padding: 8px 14px;
              border-radius: 4px;
              margin-bottom: 14px;
            }
  
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              padding: 0 4px;
            }
  
            .info-item {}
            .info-item .label {
              font-size: 11px;
              color: #888;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            .info-item .value {
              font-size: 14px;
              color: #222;
              font-weight: 500;
            }
  
            /* ── Payment Box ── */
            .payment-box {
              background: #fffbf0;
              border: 1px solid #ffe082;
              border-radius: 10px;
              padding: 18px 20px;
            }
            .payment-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px dashed #ffe082;
              margin-top: 14px;
              padding-top: 14px;
            }
            .total-label {
              font-size: 15px;
              font-weight: bold;
              color: #555;
            }
            .total-amount {
              font-size: 22px;
              font-weight: bold;
              color: #0066cc;
            }
  
            /* ── Footer ── */
            .footer {
              text-align: center;
              background: #f9f9f9;
              border-top: 1px solid #eee;
              padding: 16px;
              font-size: 12px;
              color: #aaa;
            }
          </style>
        </head>
        <body>
          <div class="card">
  
            <!-- Header -->
            <div class="header">
              <h1>🏥 HealthCare Center</h1>
              <p>Official Payment Receipt</p>
              <div class="badge">✅ Payment Successful</div>
              <p class="date">📅 ${data.date}</p>
            </div>
  
            <div class="body">
  
              <!-- Patient Info -->
              <div class="section">
                <div class="section-title">👤 Patient Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="label">Full Name</div>
                    <div class="value">${data.patientName}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Email</div>
                    <div class="value">${data.patientEmail}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Age</div>
                    <div class="value">${data.patientAge ?? "N/A"}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Gender</div>
                    <div class="value">${data.patientGender ?? "N/A"}</div>
                  </div>
                </div>
              </div>
  
              <!-- Doctor Info -->
              <div class="section">
                <div class="section-title">🩺 Doctor Information</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="label">Doctor Name</div>
                    <div class="value">${data.doctorName}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Specialization</div>
                    <div class="value">${data.doctorSpecialization ?? "N/A"}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">Consultation Fee</div>
                    <div class="value">৳ ${data.doctorFee}</div>
                  </div>
                </div>
              </div>
  
              <!-- Payment Info -->
              <div class="section">
                <div class="section-title">💳 Payment Information</div>
                <div class="payment-box">
                  <div class="payment-grid">
                    <div class="info-item">
                      <div class="label">Appointment ID</div>
                      <div class="value" style="font-size:12px">${data.appointmentId}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">Payment ID</div>
                      <div class="value" style="font-size:12px">${data.paymentId}</div>
                    </div>
                    <div class="info-item">
                      <div class="label">Payment Method</div>
                      <div class="value">Card (Stripe)</div>
                    </div>
                    <div class="info-item">
                      <div class="label">Status</div>
                      <div class="value" style="color:#2e7d32; font-weight:bold;">PAID ✅</div>
                    </div>
                  </div>
                  <div class="total-row">
                    <span class="total-label">Total Amount Paid</span>
                    <span class="total-amount">৳ ${data.amount}</span>
                  </div>
                </div>
              </div>
  
            </div>
  
            <!-- Footer -->
            <div class="footer">
              <p>This is a computer-generated payment receipt. Please keep this for your records.</p>
            </div>
  
          </div>
        </body>
      </html>
    `);
  
    const buffer = await page.screenshot({ type: "png", fullPage: true });
    await browser.close();
  
    return buffer as Buffer;
  };