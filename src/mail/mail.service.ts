import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import { ISendEmail } from 'src/mail/interfaces/send-email.interface';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.GMAIL_HOST,
      port: process.env.GMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const handlebarsOptions = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: 'templates',
        layoutsDir: 'templates',
        defaultLayout: false,
      },
      viewPath: 'templates',
      extName: '.handlebars',
    };

    this.transporter.use('compile', hbs(handlebarsOptions));
  }

  async sendUserNotificationEmail(data: ISendEmail, buffer: Buffer): Promise<void> {
    const { name, reason, email, rejectReason, id } = data;

    const template = rejectReason ? 'rejected' : 'success';

    const subject = rejectReason ? 'Adeverină respinsă' : 'Adeverină aprobată';

    await this.transporter.sendMail({
      subject,
      template,
      to: email,
      from: process.env.GMAIL_USER,
      context: {
        name,
        reason,
        rejectReason,
      },
      attachments: !rejectReason
        ? [
            {
              content: buffer,
              filename: `${id}.pdf`,
              contentType: 'application/pdf',
            },
          ]
        : [],
    });
  }

  async sendSecretaryMonthlyReportEmail(to: string, buffer: Buffer): Promise<void> {
    await this.transporter.sendMail({
      to,
      subject: 'Raport lunar',
      template: 'monthly-report',
      text: 'Raport lunar pe baza adeverințelor emise până la momentul actual.',
      from: process.env.GMAIL_USER,
      context: {},
      attachments: [
        {
          content: buffer,
          filename: 'raport-lunar.pdf',
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
