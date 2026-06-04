import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    transporter = { sendMail: async () => {} };
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

export const sendShareNotificationEmail = async ({ to, sharedByName, noteTitle, noteUrl, type = "note" }) => {
  const appName = "Share Notes";
  const from = process.env.SMTP_FROM || `"${appName}" <${process.env.SMTP_USER || "noreply@sharenote.app"}>`;
  const emoji = type === "task" ? "📝" : type === "file" ? "📁" : "📄";
  const typeLabel = type === "task" ? "tarea" : type === "file" ? "archivo" : "nota";

  await getTransporter().sendMail({
    from,
    to,
    subject: `${sharedByName} ha compartido un${type === "task" || type === "file" ? " " : "a "}${typeLabel} contigo - ${appName}`,
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: 800;">S</span>
            </div>
            <h2 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">${appName}</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Plataforma de Notas Colaborativas</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />

          <div style="text-align: center; font-size: 48px; margin-bottom: 16px;">${emoji}</div>
          <h3 style="color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 600;">
            ${sharedByName} ha compartido un${type === "task" || type === "file" ? " " : "a "}${typeLabel} contigo
          </h3>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            <strong style="color: #111827;">${noteTitle}</strong>
          </p>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${noteUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 12px 32px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Ver ${typeLabel}
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            Inicia sesión en ${appName} para ver el contenido completo.
          </p>

        </div>

        <div style="text-align: center; margin-top: 16px; color: #9ca3af; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.
        </div>
      </div>
    `,
  });
};

export const sendResetEmail = async (to, resetUrl) => {
  const appName = "Share Notes";
  const from = process.env.SMTP_FROM || `"${appName}" <${process.env.SMTP_USER || "noreply@sharenote.app"}>`;

  await getTransporter().sendMail({
    from,
    to,
    subject: `Restablecer tu contraseña - ${appName}`,
    html: `
      <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">

          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: 800;">S</span>
            </div>
            <h2 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">${appName}</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Plataforma de Notas Colaborativas</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />

          <h3 style="color: #111827; font-size: 20px; margin-top: 0; margin-bottom: 16px; font-weight: 600;">Restablecer tu contraseña</h3>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta vinculada a este correo electrónico: <strong style="color: #111827;">${to}</strong>.
          </p>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 12px 32px; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Restablecer contraseña
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            * Este enlace de seguridad expirar\u00e1 en 1 hora.<br>
            * Si t\u00fa no solicitaste este cambio, puedes ignorar este correo de forma segura y tu contrase\u00f1a seguir\u00e1 siendo la misma.
          </p>

        </div>

        <div style="text-align: center; margin-top: 16px; color: #9ca3af; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.
        </div>
      </div>
    `,
  });
};
