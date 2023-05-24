import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from 'src/certificates/certificates.service';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';
import { MessageResponse } from 'src/reponse/message-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { Certificate } from 'src/certificates/certificates.model';
import { RejectCertificateDto } from 'src/certificates/dto/reject-certificate.dto';
import { ApproveCertificateDto } from 'src/certificates/dto/approve-certificate.dto';

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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user certificates' })
  @Get()
  async getUserCertificates(@UserId() userId: number): Promise<Certificate[]> {
    return this.certificatesService.getUserCertificates(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject certificate' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Patch(':id/reject')
  async rejectCertificate(
    @Param('id') id: number,
    @Body() dto: RejectCertificateDto,
  ): Promise<MessageResponse> {
    return this.certificatesService.rejectCertificate(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve certificate' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Patch(':id/approve')
  async approveCertificate(
    @Param('id') id: number,
    @Body() dto: ApproveCertificateDto,
  ): Promise<MessageResponse> {
    return this.certificatesService.approveCertificate(id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get certificate .pdf' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Get(':id/download')
  async getCertificatePdf(@Param('id') id: number, @Res() res): Promise<void> {
    try {
      const certificatePdf: Buffer = await this.certificatesService.getCertificatePdf(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=pdf.pdf`,
        'Content-Length': certificatePdf.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      });
      res.end(certificatePdf);
    } catch (error) {
      if (error instanceof NotFoundException) res.status(404).send({ error: error.message });
      else res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
