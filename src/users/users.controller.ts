import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @Get('/users')
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
}
