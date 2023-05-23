import { Injectable } from '@nestjs/common';
import { User } from 'src/users/users.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Certificate } from 'src/certificates/certificates.model';
import { UpdateUsersDto } from 'src/users/dto/update-users.dto';
import { ExcelService } from 'src/excel/excel.service';

@Injectable()
export class UsersService {
  constructor(
    private excelService: ExcelService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    const users: User[] = await this.userRepository.find({ select: ['name', 'email'] });
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

  async createUser(user: CreateUserDto): Promise<User> {
    const newUser: User = await this.userRepository.save(user);
    return newUser;
  }

  async getUserCertificates(id: number): Promise<Certificate[]> {
    const user: User = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.certificates', 'certificates')
      .where('user.id = :id', { id })
      .orderBy('certificates.id', 'DESC')
      .getOne();
    return user.certificates;
  }

  async updateAllUsers(
    files: Express.Multer.File[],
    { facultyName, concatenateName }: UpdateUsersDto,
  ) {
    const res = this.excelService.convertExcelToJson(files[1], JSON.parse(concatenateName), {
      faculty_name: facultyName,
    });
    console.log(res);
  }
}
