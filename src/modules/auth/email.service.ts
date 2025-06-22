import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || '587');
    const isSecure = port === 465;
    
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: port,
      secure: isSecure, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // Para desarrollo
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    console.log('🔄 [EMAIL] Iniciando envío de email de verificación para:', email);
    
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@itravelly.com',
      to: email,
      subject: 'Verificación de Email - ITravelly',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verificación de Email</h2>
          <p>Hola,</p>
          <p>Gracias por registrarte en ITravelly. Para completar tu registro, por favor ingresa el siguiente código de verificación:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>Este código expirará en 10 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este email.</p>
          <p>Saludos,<br>Equipo de ITravelly</p>
        </div>
      `,
    };

    try {
      console.log('📧 [EMAIL] Configuración SMTP:', {
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<string>('SMTP_PORT'),
        user: this.configService.get<string>('SMTP_USER'),
        from: mailOptions.from
      });
      
      await this.transporter.sendMail(mailOptions);
      console.log('✅ [EMAIL] Email enviado exitosamente a:', email);
    } catch (error) {
      console.error('❌ [EMAIL] Error enviando email a:', email);
      console.error('❌ [EMAIL] Detalles del error:', {
        message: error.message,
        code: error.code,
        command: error.command
      });
      
      // En desarrollo, loguear el código en lugar de fallar
      console.log('📋 [EMAIL] Código de verificación para desarrollo:', email, 'Código:', code);
      
      // No lanzar el error para que el registro continúe
      // throw error;
    }
  }
} 