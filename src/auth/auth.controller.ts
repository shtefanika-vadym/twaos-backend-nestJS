import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MessageResponse } from 'src/reponse/message-response';
import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponse } from 'src/auth/responses/login-response';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: LoginResponse })
  @Post('/login')
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Post('/register')
  register(@Body() userDto: CreateUserDto): Promise<MessageResponse> {
    return this.authService.register(userDto);
  }
}
