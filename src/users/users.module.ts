import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from 'src/certificates/certificates.model';
import { ExcelService } from 'src/excel/excel.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ExcelService, MailService],
  imports: [TypeOrmModule.forFeature([User, Certificate]), forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
