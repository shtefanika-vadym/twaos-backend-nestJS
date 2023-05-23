import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from 'src/certificates/certificates.model';
import { MessageResponse } from 'src/reponse/message-response';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';
import { UsersService } from 'src/users/users.service';
import { CertificateStatus } from 'src/certificates/enum/certificate-status';
import { ApproveCertificateDto } from 'src/certificates/dto/approve-certificate.dto';
import { RejectCertificateDto } from 'src/certificates/dto/reject-certificate.dto';
import { MailService } from 'src/mail/mail.service';
import { ISendEmail } from 'src/mail/interfaces/send-email.interface';

@Injectable()
export class CertificatesService {
  constructor(
    private mailService: MailService,
    private userService: UsersService,
    @InjectRepository(Certificate) private certificateRepository: Repository<Certificate>,
  ) {}

  async createCertificate(
    certificateDto: CreateCertificateDto,
    userId: number,
  ): Promise<MessageResponse> {
    const user = await this.userService.getUserById(userId);
    const certificate = {
      user,
      ...certificateDto,
      status: CertificateStatus.pending,
      certificateId: '334/1/FIESC/20.10.2023',
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

    if (!certificate) throw new NotFoundException('Adeverinţa nu a fost gasită');
    if (certificate.status === CertificateStatus.rejected)
      throw new NotFoundException('Adeverinţa este deja respinsă');
    if (certificate.status === CertificateStatus.approved)
      throw new NotFoundException('Adeverinţa este deja aprobată');

    certificate.status = CertificateStatus.rejected;
    certificate.rejectReason = dto.rejectReason;
    await this.certificateRepository.save(certificate);

    const emailData: ISendEmail = {
      name: user.first_name,
      email: user.email,
      reason: certificate.reason,
      rejectReason: certificate.rejectReason,
    };

    if (dto.notifyUser) this.mailService.sendUserNotificationEmail(emailData);

    return { message: 'Adeverinţa a fost respinsă cu succes' };
  }

  async approveCertificate(id: number, dto: ApproveCertificateDto): Promise<MessageResponse> {
    const certificate: Certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    const { user } = certificate;

    if (!certificate) throw new NotFoundException('Adeverinţa nu a fost gasită');
    if (certificate.status === CertificateStatus.rejected)
      throw new NotFoundException('Adeverinţa este deja respinsă');
    if (certificate.status === CertificateStatus.approved)
      throw new NotFoundException('Adeverinţa este deja aprobată');

    certificate.status = CertificateStatus.approved;
    await this.certificateRepository.save(certificate);

    const emailData: ISendEmail = {
      name: user.first_name,
      email: user.email,
      reason: certificate.reason,
    };

    if (dto.notifyUser) this.mailService.sendUserNotificationEmail(emailData);

    return { message: 'Adeverinţa a fost aprobată cu succes' };
  }
}
