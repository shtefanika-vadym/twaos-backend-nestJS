import {
  Body,
  Controller,
  Get,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { excelFilter } from 'src/filters/image.filter';
import { UpdateUsersDto } from 'src/users/dto/update-users.dto';
import { MessageResponse } from 'src/reponse/message-response';
import { UserId } from 'src/auth/user-id.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { UserRole } from 'src/users/roles/user-role';
import { SelectResponse } from 'src/reponse/select-response';

@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @Get('/details')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, type: User })
  async getUserDetails(@UserId() id: number): Promise<User> {
    return this.usersService.getUserDetails(id);
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Update all users' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, type: MessageResponse })
  @UseInterceptors(FilesInterceptor('files', 2, { fileFilter: excelFilter }))
  async updateAllUsers(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body()
    updateUsersDto: UpdateUsersDto,
  ): Promise<MessageResponse> {
    return this.usersService.updateAllUsers(files, updateUsersDto);
  }

  @Get('/secretaries')
  @UseGuards(RolesGuard)
  @Roles(UserRole.secretary)
  @ApiOperation({ summary: 'Get secretaries from faculty' })
  @ApiResponse({ status: 200, type: [SelectResponse] })
  async getAllFacultySecretaries(@UserId() id: number): Promise<SelectResponse[]> {
    return this.usersService.getAllFacultySecretaries(id);
  }
}
