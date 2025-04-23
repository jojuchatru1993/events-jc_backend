import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Solicitud de restablecimiento de contraseña',
      text: `Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para continuar: ${resetUrl}\n\nEste enlace caducará en 5 minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Solicitud de restablecimiento de contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el botón de abajo para continuar:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          </div>
          <p>Si el botón anterior no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px;">Este enlace caducará en 5 minutos.</p>
          <p style="color: #666; font-size: 12px;">Si no solicitaste este restablecimiento de contraseña, por favor ignora este correo.</p>
        </div>
      `,
    });
  }
}
