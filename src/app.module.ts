import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/users/users.model';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { Certificate } from 'src/certificates/certificates.model';
import { CertificatesModule } from 'src/certificates/certificates.module';
import { UsersService } from 'src/users/users.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ReplacementsModule } from 'src/replcements/replacements.module';
import { Replacement } from 'src/replcements/replacements.model';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      synchronize: true,
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRESS_PORT,
      database: process.env.POSTGRES_DB,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRESS_PASSWORD,
      entities: [User, Certificate, Replacement],
    }),
    UsersModule,
    AuthModule,
    CertificatesModule,
    ReplacementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    this.usersService.createAdmin();
  }
}
