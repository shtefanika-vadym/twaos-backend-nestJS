import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.model';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Certificate } from 'src/certificates/certificates.model';
import { UpdateUsersDto } from 'src/users/dto/update-users.dto';
import { ExcelService } from 'src/excel/excel.service';
import { UserRole } from 'src/users/roles/user-role';
import { MessageResponse } from 'src/reponse/message-response';

@Injectable()
export class UsersService {
  constructor(
    private excelService: ExcelService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Certificate) private certificateRepository: Repository<Certificate>,
  ) {}

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

  async getUserCertificates(id: number): Promise<Certificate[]> {
    const user: User = await this.userRepository.findOne({
      where: { id },
      order: { certificates: { id: 'DESC' } },
      relations: { certificates: true },
    });

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
