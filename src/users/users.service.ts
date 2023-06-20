import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.model';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Certificate } from 'src/certificates/certificates.model';
import { UpdateUsersDto } from 'src/users/dto/update-users.dto';
import { ExcelService } from 'src/excel/excel.service';
import { UserRole } from 'src/users/roles/user-role';
import { MessageResponse } from 'src/reponse/message-response';
import { SelectResponse } from 'src/reponse/select-response';
import { Replacement } from 'src/replcements/replacements.model';
import { CertificateStatus } from 'src/certificates/enum/certificate-status';

@Injectable()
export class UsersService {
  constructor(
    private excelService: ExcelService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Replacement) private replacementRepository: Repository<Replacement>,
    @InjectRepository(Certificate) private certificateRepository: Repository<Certificate>,
  ) {}

  async getAllFacultySecretaries(id: number): Promise<SelectResponse[]> {
    const secretary: User = await this.getUserById(id);
    const secretaries: User[] = await this.userRepository.find({
      where: { id: Not(id), role: UserRole.secretary, faculty_name: secretary.faculty_name },
      select: ['id', 'first_name', 'last_name'],
    });
    const secretariesSelect: SelectResponse[] = secretaries.map(
      (secretary: User): SelectResponse => ({
        value: String(secretary.id),
        label: secretary.first_name + ' ' + secretary?.last_name,
      }),
    );
    return secretariesSelect;
  }

  async getAllUsers(): Promise<User[]> {
    const users: User[] = await this.userRepository.find({
      where: { role: UserRole.student },
      select: [
        'email',
        'first_name',
        'last_name',
        'initials',
        'faculty_name',
        'program_study',
        'field_study',
        'year_study',
        'status',
      ],
    });
    return users;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { id },
    });
    return user;
  }

  async getUserDetails(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      select: [
        'email',
        'first_name',
        'last_name',
        'field_study',
        'status',
        'initials',
        'faculty_name',
        'year_study',
        'program_study',
      ],
    });
    return user;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const newUser: User = await this.userRepository.save(user);
    return newUser;
  }

  async getSecretaries(): Promise<User[]> {
    const secretaries: User[] = await this.userRepository.find({
      where: { role: UserRole.secretary },
      select: ['id', 'email'],
    });
    return secretaries;
  }

  async getUserByIdWithCertificates(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      relations: { certificates: true },
      order: { certificates: { id: 'DESC' } },
    });
    return user;
  }

  async getUserCertificates(id: number): Promise<Certificate[]> {
    const certificates: Certificate[] = await this.getCertificatesByUserRole(id);
    const replacingCertificates: Certificate[] = await this.getCertificatesInReplacingPeriod(id);
    return [...certificates, ...replacingCertificates];
  }

  async getCertificatesInReplacingPeriod(id: number): Promise<Certificate[]> {
    let certificates: Certificate[] = [];
    const replacements: Replacement[] = await this.getReplacingSecretaries(id);

    for (let i = 0; i < replacements.length; i++) {
      const { replacedUser }: Replacement = replacements[i];
      const secretaryCertificates: Certificate[] = await this.getCertificatesByUserRole(
        replacedUser.id,
      );
      certificates = [...certificates, ...secretaryCertificates];
    }
    return certificates;
  }

  async getReplacingSecretaries(userId: number): Promise<Replacement[]> {
    const currentDate: string = new Date().toISOString();
    const activeReplacements: Replacement[] = await this.replacementRepository.find({
      relations: { replacedUser: true },
      where: {
        replacingUser: { id: userId },
        status: CertificateStatus.approved,
        end_date: MoreThanOrEqual(currentDate),
        start_date: LessThanOrEqual(currentDate),
      },
    });

    return activeReplacements;
  }

  async getCertificatesByUserRole(id: number): Promise<Certificate[]> {
    const user: User = await this.getUserByIdWithCertificates(id);
    if (user.role === UserRole.student) return user.certificates;

    const programCertificates: Certificate[] = await this.certificateRepository
      .createQueryBuilder('certificate')
      .select([
        'certificate',
        'user.first_name',
        'user.last_name',
        'user.program_study',
        'user.year_study',
        'user.field_study',
        'user.email',
        'user.status',
      ])
      .leftJoin('certificate.user', 'user')
      .where('user.program_study = :programStudy', { programStudy: user.program_study })
      .andWhere('user.faculty_name = :facultyName', { facultyName: user.faculty_name })
      .orderBy('certificate.id', 'DESC')
      .getMany();

    return programCertificates;
  }

  async createAdmin(): Promise<void> {
    const users: User[] = await this.userRepository.find();

    if (!users.length) {
      const adminPassword: string = await bcrypt.hash(process.env.APP_ADMIN_PASS, 5);

      const user: User = {
        first_name: 'Admin',
        email: 'admin@usv.ro',
        role: UserRole.admin,
        password: adminPassword,
      } as User;

      await this.userRepository.save(user);
    }
  }

  async updateAllUsers(
    files: Express.Multer.File[],
    { facultyName, concatenateName }: UpdateUsersDto,
  ): Promise<MessageResponse> {
    const students: User[] = await this.excelService.convertExcelUsersToJson(
      files[1],
      UserRole.student,
      facultyName,
      JSON.parse(concatenateName),
    );
    const secretaries: User[] = await this.excelService.convertExcelUsersToJson(
      files[0],
      UserRole.secretary,
      facultyName,
    );

    const allUsers: User[] = [...students, ...secretaries];

    const oldUsers: User[] = await this.userRepository.find({
      where: { role: In([UserRole.secretary, UserRole.student]) },
    });
    const certificates: Certificate[] = await this.certificateRepository.find();

    await this.certificateRepository.remove(certificates);
    await this.userRepository.remove(oldUsers);
    await this.userRepository.save(allUsers);

    return { message: 'Users updated successfully' };
  }
}
