import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageResponse } from 'src/reponse/message-response';
import { AppService } from 'src/app.service';

@ApiTags('Main')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'App health check' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Get('/health')
  getHealthCheck(): MessageResponse {
    return this.appService.getHealthCheck();
  }
}
