import { Injectable } from '@nestjs/common';
import { MessageResponse } from 'src/reponse/message-response';

@Injectable()
export class AppService {
  getHealthCheck(): MessageResponse {
    return { message: 'Health check' };
  }
}
