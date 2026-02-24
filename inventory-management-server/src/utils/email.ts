import envConfig from "@/config/env.js";
import nodemailer from "nodemailer";

// Send Email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envConfig.EMAIL_SENDER_USER,
    pass: envConfig.EMAIL_SENDER_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  return await transporter.sendMail({
    from: `"${envConfig.EMAIL_SENDER_NAME}" <${envConfig.EMAIL_SENDER_FROM}>`,
    to: `${to}`,
    subject: `${subject}`,
    html: `${html}`,
  });
};
