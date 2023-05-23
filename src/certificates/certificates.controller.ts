import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CertificatesService } from 'src/certificates/certificates.service';
import { CreateCertificateDto } from 'src/certificates/dto/create-certificate.dto';
import { MessageResponse } from 'src/reponse/message-response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserId } from 'src/auth/user-id.decorator';
import { Certificate } from 'src/certificates/certificates.model';
import { RejectCertificateDto } from 'src/certificates/dto/reject-certificate.dto';

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
    @Body() dto: RejectCertificateDto,
  ): Promise<MessageResponse> {
    return this.certificatesService.approveCertificate(id, dto);
  }
}
