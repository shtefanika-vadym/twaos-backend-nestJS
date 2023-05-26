import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Certificate } from 'src/certificates/certificates.model';
import { MessageResponse } from 'src/reponse/message-response';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';
import { UsersService } from 'src/users/users.service';
import { CertificateStatus } from 'src/certificates/enum/certificate-status';
import { ApproveCertificateDto } from 'src/certificates/dto/approve-certificate.dto';
import { RejectCertificateDto } from 'src/certificates/dto/reject-certificate.dto';
import { MailService } from 'src/mail/mail.service';
import { ISendEmail } from 'src/mail/interfaces/send-email.interface';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/users/users.model';
import { UserRole } from 'src/users/roles/user-role';

@Injectable()
export class CertificatesService {
  constructor(
    private mailService: MailService,
    private userService: UsersService,
    private puppeteerService: PuppeteerService,
    @InjectRepository(Certificate) private certificateRepository: Repository<Certificate>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async notifySecretariesEveryMonth(): Promise<void> {
    const secretaries: User[] = await this.userService.getSecretaries();
    for (const secretary of secretaries) {
      const response: Buffer = await this.getSecretaryMonthlyReportPdf(secretary.id);
      await this.mailService.sendSecretaryMonthlyReportEmail(secretary.email, response);
    }
  }

  async createCertificate(
    certificateDto: CreateCertificateDto,
    userId: number,
  ): Promise<MessageResponse> {
    const user = await this.userService.getUserById(userId);
    const certificate = {
      user,
      ...certificateDto,
      status: CertificateStatus.pending,
    };
    await this.certificateRepository.save(certificate);
    return { message: 'Adeverința a fost creată cu succes' };
  }

  async getUserCertificates(userId: number): Promise<Certificate[]> {
    const certificates: Certificate[] = await this.userService.getUserCertificates(userId);
    return certificates;
  }

  async rejectCertificate(id: number, dto: RejectCertificateDto): Promise<MessageResponse> {
    const certificate: Certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    const { user } = certificate;

    if (!certificate) throw new NotFoundException('Certificate not found');
    if (certificate.status === CertificateStatus.rejected)
      throw new NotFoundException('Certificate already rejected');
    if (certificate.status === CertificateStatus.approved)
      throw new NotFoundException('Certificate already approved');

    certificate.status = CertificateStatus.rejected;
    certificate.rejectReason = dto.rejectReason;
    await this.certificateRepository.save(certificate);

    const emailData: ISendEmail = {
      name: user.first_name,
      email: user.email,
      reason: certificate.reason,
      id: certificate.certificateId,
      rejectReason: certificate.rejectReason,
    };

    if (dto.notifyUser) {
      const certificatePdf: Buffer = await this.getCertificatePdf(id);
      this.mailService.sendUserNotificationEmail(emailData, certificatePdf);
    }

    return { message: 'Certificate rejected successfully' };
  }

  async approveCertificate(id: number, dto: ApproveCertificateDto): Promise<MessageResponse> {
    const certificate: Certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!certificate) throw new NotFoundException('Certificate not found');
    if (certificate.status === CertificateStatus.rejected)
      throw new NotFoundException('Certificate already rejected');
    if (certificate.status === CertificateStatus.approved)
      throw new NotFoundException('Certificate already approved');

    const { user } = certificate;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const formattedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;

    const approvedCertificates: Certificate[] = await this.certificateRepository.find({
      where: {
        status: 'approved',
        created_at: Between(todayStart, todayEnd),
        user: { faculty_name: user.faculty_name },
      },
    });

    certificate.status = CertificateStatus.approved;
    certificate.certificateId = `${approvedCertificates.length + 1}/${
      user.faculty_name
    }/${formattedDate}`;
    await this.certificateRepository.save(certificate);

    const emailData: ISendEmail = {
      name: user.first_name,
      email: user.email,
      reason: certificate.reason,
      id: certificate.certificateId,
    };

    if (dto.notifyUser) {
      const certificatePdf: Buffer = await this.getCertificatePdf(id);
      this.mailService.sendUserNotificationEmail(emailData, certificatePdf);
    }

    return { message: 'Certificate approved successfully' };
  }

  async getCertificatePdf(id: number): Promise<Buffer> {
    const certificate: Certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    const response: Buffer = await this.puppeteerService.generatePDF(
      'certificate.handlebars',
      certificate,
    );
    return response;
  }

  async getSecretaryMonthlyReportPdf(id: number): Promise<Buffer> {
    const user: User = await this.userService.getUserById(id);

    const startOfMonth: Date = new Date();
    startOfMonth.setDate(1);

    const endOfMonth: Date = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

    const certificates: Certificate[] = await this.certificateRepository.find({
      relations: { user: true },
      where: {
        created_at: Between(startOfMonth, endOfMonth),
        user: {
          role: UserRole.student,
          faculty_name: user.faculty_name,
          program_study: user.program_study,
        },
      },
    });

    const updatedCertificates = certificates.map(
      ({ status, created_at, updated_at, ...rest }: Certificate) => ({
        ...rest,
        created_at: created_at.toISOString().slice(0, 10),
        updated_at: updated_at.toISOString().slice(0, 10),
        status:
          status === CertificateStatus.approved
            ? 'Aprobat'
            : status === CertificateStatus.rejected
            ? 'Respins'
            : 'În procesare',
      }),
    );

    const response: Buffer = await this.puppeteerService.generatePDF('monthly-report.handlebars', {
      certificates: updatedCertificates,
    });
    return response;
  }
}
