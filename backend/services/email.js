const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send confirmation email to complainant
 */
async function sendComplaintConfirmation({ to, name, complaintId, crimeType, subject }) {
  const mailOptions = {
    from: `"CyberShield Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Complaint Registered — ${complaintId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family:Arial,sans-serif;background:#f5f4f0;padding:40px 0">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0dfd8">
          <div style="background:#0040ff;padding:28px 32px">
            <h1 style="color:#fff;margin:0;font-size:1.4rem">🛡️ CyberShield</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:0.9rem">Cyber Crime Complaint Portal</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:1.2rem;color:#0a0a0a;margin-bottom:8px">Complaint Registered Successfully</h2>
            <p style="color:#6b6b6b;margin-bottom:24px">Dear <strong>${name}</strong>, your complaint has been received and assigned to our team.</p>

            <div style="background:#e8edff;border-radius:10px;padding:20px 24px;margin-bottom:24px">
              <p style="margin:0 0 6px;font-size:0.8rem;color:#0040ff;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Your Complaint ID</p>
              <p style="margin:0;font-size:1.6rem;font-weight:800;color:#0040ff;font-family:monospace">${complaintId}</p>
              <p style="margin:6px 0 0;font-size:0.8rem;color:#6b6b6b">Save this ID to track your complaint status</p>
            </div>

            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr><td style="padding:10px 0;border-bottom:1px solid #e0dfd8;font-size:0.85rem;color:#6b6b6b;width:140px">Crime Type</td><td style="padding:10px 0;border-bottom:1px solid #e0dfd8;font-size:0.85rem;color:#0a0a0a;font-weight:600">${crimeType}</td></tr>
              <tr><td style="padding:10px 0;font-size:0.85rem;color:#6b6b6b">Subject</td><td style="padding:10px 0;font-size:0.85rem;color:#0a0a0a">${subject}</td></tr>
            </table>

            <a href="${process.env.FRONTEND_URL}/track?id=${complaintId}" style="display:inline-block;background:#0040ff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem">Track Your Complaint →</a>

            <p style="margin-top:24px;font-size:0.8rem;color:#6b6b6b;line-height:1.6">Our team will review your complaint and update the status within 24 hours. If you have additional evidence, reply to this email.</p>
          </div>
          <div style="background:#f5f4f0;padding:16px 32px;text-align:center">
            <p style="margin:0;font-size:0.75rem;color:#6b6b6b">CyberShield — Official Cyber Crime Reporting Portal, India</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Confirmation sent to ${to}`);
}

/**
 * Send status update email to complainant
 */
async function sendStatusUpdate({ to, name, complaintId, newStatus }) {
  const statusColors = {
    Investigating: '#d97706',
    Resolved: '#059669',
    Closed: '#6b7280',
  };
  const color = statusColors[newStatus] || '#0040ff';

  const mailOptions = {
    from: `"CyberShield Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🔔 Complaint Update — ${complaintId} is now ${newStatus}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#f5f4f0;padding:40px 0">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0dfd8">
          <div style="background:#0040ff;padding:28px 32px">
            <h1 style="color:#fff;margin:0;font-size:1.4rem">🛡️ CyberShield</h1>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:1.2rem;color:#0a0a0a">Complaint Status Updated</h2>
            <p style="color:#6b6b6b;margin-bottom:24px">Dear <strong>${name}</strong>, your complaint status has been updated.</p>
            <div style="background:#f5f4f0;border-radius:10px;padding:20px;margin-bottom:24px;display:flex;align-items:center;gap:16px">
              <div>
                <p style="margin:0 0 4px;font-size:0.8rem;color:#6b6b6b">Complaint ID</p>
                <p style="margin:0;font-size:1rem;font-weight:800;font-family:monospace">${complaintId}</p>
              </div>
              <div style="margin-left:auto">
                <span style="background:${color};color:#fff;padding:6px 14px;border-radius:100px;font-size:0.85rem;font-weight:600">${newStatus}</span>
              </div>
            </div>
            <a href="${process.env.FRONTEND_URL}/track?id=${complaintId}" style="display:inline-block;background:#0040ff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem">View Complaint →</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Status update sent to ${to}`);
}

module.exports = { sendComplaintConfirmation, sendStatusUpdate };
