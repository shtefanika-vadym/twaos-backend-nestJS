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
  }

  async sendUserNotificationEmail(data: ISendEmail): Promise<void> {
    const { name, reason, email, rejectReason } = data;

    const template = rejectReason ? 'rejected' : 'success';

    const handlebarsOptions = {
      viewEngine: {
        extName: '.handlebars',
        partialsDir: 'templates',
        layoutsDir: 'templates',
        defaultLayout: template,
      },
      viewPath: 'templates',
      extName: '.handlebars',
    };

    this.transporter.use('compile', hbs(handlebarsOptions));

    const subject = rejectReason ? 'Adeverină respinsă' : 'Adeverină aprobată';

    const res = await this.transporter.sendMail({
      subject,
      template: template,
      to: email,
      from: process.env.GMAIL_USER,
      context: {
        name,
        reason,
        rejectReason,
      },
      // attachments: [
      //   {
      //     filename: 'document.pdf',
      //     content: [],
      //     contentType: 'application/pdf',
      //   },
      // ],
    });
    console.log(res);
  }
}
