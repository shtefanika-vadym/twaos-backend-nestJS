import { forwardRef, Module } from '@nestjs/common';
import { CertificatesController } from 'src/certificates/certificates.controller';
import { CertificatesService } from 'src/certificates/certificates.service';
import { AuthModule } from 'src/auth/auth.module';
import { Certificate } from 'src/certificates/certificates.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { ExcelService } from 'src/excel/excel.service';
import { MailService } from 'src/mail/mail.service';
import { PuppeteerService } from 'src/puppeteer/puppetter.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, UsersService, ExcelService, MailService, PuppeteerService],
  imports: [TypeOrmModule.forFeature([Certificate, User]), forwardRef(() => AuthModule)],
  exports: [CertificatesService],
})
export class CertificatesModule {}
