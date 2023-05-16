import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from 'src/certificates/certificates.service';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';
import { MessageResponse } from 'src/reponse/message-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { Certificate } from 'src/certificates/certificates.model';

@ApiTags('Certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create certificate' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Post()
  async createCertificate(
    @UserId() userId: number,
    @Body() certificateDto: CreateCertificateDto,
  ): Promise<MessageResponse> {
    return this.certificatesService.createCertificate(certificateDto, userId);
  }

  @Get()
  async getCertificates(): Promise<Certificate[]> {
    return this.certificatesService.getCertificates();
  }
}
