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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, type: User })
  @Get('/details')
  async getUserDetails(@UserId() id: number): Promise<User> {
    return this.usersService.getUserDetails(id);
  }

  @ApiOperation({ summary: 'Update all users' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, type: MessageResponse })
  @UseInterceptors(FilesInterceptor('files', 2, { fileFilter: excelFilter }))
  @Put()
  async updateAllUsers(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body()
    updateUsersDto: UpdateUsersDto,
  ): Promise<MessageResponse> {
    return this.usersService.updateAllUsers(files, updateUsersDto);
  }
}
