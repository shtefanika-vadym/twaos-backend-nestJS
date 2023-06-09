import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from 'src/certificates/certificates.model';
import { ExcelService } from 'src/excel/excel.service';
import { MailService } from 'src/mail/mail.service';
import { ReplacementsService } from 'src/replcements/replacements.service';
import { Replacement } from 'src/replcements/replacements.model';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ExcelService, MailService, ReplacementsService],
  imports: [
    TypeOrmModule.forFeature([User, Certificate, Replacement]),
    forwardRef(() => AuthModule),
  ],
  exports: [UsersService],
})
export class UsersModule {}
