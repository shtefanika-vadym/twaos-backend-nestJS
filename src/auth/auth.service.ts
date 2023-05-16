import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponse } from 'src/auth/responses/login-response';
import { MessageResponse } from 'src/reponse/message-response';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async login(userDto: LoginDto): Promise<LoginResponse> {
    const user: User = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async register(userDto: CreateUserDto): Promise<MessageResponse> {
    const candidate: User = await this.usersService.getUserByEmail(userDto.email);
    if (candidate)
      throw new HttpException('User with same email already exists', HttpStatus.BAD_REQUEST);

    const hashPassword = await bcrypt.hash(userDto.password, 5);
    await this.usersService.createUser({
      ...userDto,
      password: hashPassword,
    });
    return { message: 'User successfully registered.' };
  }

  async generateToken(user: User): Promise<LoginResponse> {
    return {
      token: this.jwtService.sign({ email: user.email, id: user.id }),
    };
  }

  async validateUser(userDto: LoginDto): Promise<User> {
    const user: User = await this.usersService.getUserByEmail(userDto.email);
    if (!user)
      throw new NotFoundException({
        message: 'User not found',
      });

    const passwordEquals = await bcrypt.compare(userDto.password, user.password);
    if (user && passwordEquals) return user;

    throw new BadRequestException({
      message: 'Invalid email or password',
    });
  }
}
