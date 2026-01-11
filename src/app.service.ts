import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
@Injectable()
export class AppService {
  getHello( req: Request ): string {
    return ` THE APP IS RUNING ON HOST ${req.get('host')} ON PORT ${req.get('port')}!`;
  }
}
