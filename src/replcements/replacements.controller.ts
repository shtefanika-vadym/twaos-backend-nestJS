import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReplacementsService } from 'src/replcements/replacements.service';
import { UserId } from 'src/auth/user-id.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateReplacementDto } from 'src/replcements/dto/create-replacement.dto';
import { MessageResponse } from 'src/reponse/message-response';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/roles/user-role';
import { ReplacementResponse } from 'src/replcements/responses/replacement-response';

@UseGuards(JwtAuthGuard)
@ApiTags('Replacements')
@Controller('replacements')
export class ReplacementsController {
  constructor(private replacementsService: ReplacementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.secretary)
  @ApiOperation({ summary: 'Create secretary replacement' })
  @ApiResponse({ status: 200, type: MessageResponse })
  async createReplacement(
    @Body() dto: CreateReplacementDto,
    @UserId() id: number,
  ): Promise<MessageResponse> {
    return this.replacementsService.createReplacement(id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.secretary)
  @ApiOperation({ summary: 'Get replacements for secretary' })
  @ApiResponse({ status: 200, type: [ReplacementResponse] })
  async getUserReplacements(@UserId() id: number): Promise<ReplacementResponse[]> {
    return this.replacementsService.getUserReplacements(id);
  }

  @Get('/replacing')
  @UseGuards(RolesGuard)
  @Roles(UserRole.secretary)
  @ApiOperation({ summary: 'Get replacements made by secretary' })
  @ApiResponse({ status: 200, type: [ReplacementResponse] })
  async getUserReplacing(@UserId() id: number): Promise<ReplacementResponse[]> {
    return this.replacementsService.getUserReplacing(id);
  }

  @Patch('/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.secretary)
  @ApiOperation({ summary: 'Approve replacement' })
  @ApiResponse({ status: 200, type: MessageResponse })
  async approveReplacement(
    @UserId() secretaryId: number,
    @Param('id') id: number,
  ): Promise<MessageResponse> {
    return this.replacementsService.approveReplacement(secretaryId, id);
  }

  @Patch('/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.secretary)
  @ApiOperation({ summary: 'Reject replacement' })
  @ApiResponse({ status: 200, type: MessageResponse })
  async rejectReplacement(
    @UserId() secretaryId: number,
    @Param('id') id: number,
  ): Promise<MessageResponse> {
    return this.replacementsService.rejectReplacement(secretaryId, id);
  }
}
