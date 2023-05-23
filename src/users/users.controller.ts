import { Body, Controller, Get, Put, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { excelFilter } from 'src/filters/image.filter';
import { UpdateUsersDto } from 'src/users/dto/update-users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Update all users' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 2, { fileFilter: excelFilter }))
  @Put()
  async updateAllUsers(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body()
    updateUsersDto: UpdateUsersDto,
  ) {
    return this.usersService.updateAllUsers(files, updateUsersDto);
  }
}
