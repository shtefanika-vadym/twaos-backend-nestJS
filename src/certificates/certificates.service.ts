import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from 'src/certificates/certificates.model';
import { MessageResponse } from 'src/reponse/message-response';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate) private certificateRepository: Repository<Certificate>,
  ) {}

  async createCertificate(
    certificateDto: CreateCertificateDto,
    userId: number,
  ): Promise<MessageResponse> {
    const certificate = {
      ...certificateDto,
      approved: false,
      userId,
      certificateId: '334/1/FIESC/20.10.2023',
    };
    const response: Certificate = await this.certificateRepository.save(certificate);
    return { message: 'Certificate created successfully' };
  }

  async getCertificates(): Promise<Certificate[]> {
    const certificates: Certificate[] = await this.certificateRepository.find();
    return certificates;
  }
}
