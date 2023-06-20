import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/users/users.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExcelService } from 'src/excel/excel.service';
import { MailService } from 'src/mail/mail.service';
import { ReplacementsService } from 'src/replcements/replacements.service';
import { Replacement } from 'src/replcements/replacements.model';
import { ReplacementsController } from 'src/replcements/replacements.controller';
import { UsersService } from 'src/users/users.service';
import { Certificate } from 'src/certificates/certificates.model';

@Module({
  controllers: [ReplacementsController],
  providers: [ReplacementsService, ExcelService, MailService, UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Replacement, Certificate]),
    forwardRef(() => AuthModule),
  ],
  exports: [ReplacementsService],
})
export class ReplacementsModule {}
