import { forwardRef, Module } from '@nestjs/common';
import { CertificatesController } from 'src/certificates/certificates.controller';
import { CertificatesService } from 'src/certificates/certificates.service';
import { AuthModule } from 'src/auth/auth.module';
import { Certificate } from 'src/certificates/certificates.model';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService],
  imports: [TypeOrmModule.forFeature([Certificate]), forwardRef(() => AuthModule)],
  exports: [],
})
export class CertificatesModule {}
