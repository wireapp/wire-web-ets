import {Controller, Get, Req, Res} from '@nestjs/common';
import {Request, Response} from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class RootController {
  constructor() {
  }

  @ApiExcludeEndpoint()
  @Get()
  getMainPage(@Req() req: Request, @Res() res: Response): void {
    if (req.url === '/') {
      res.redirect('/documentation');
    }
  }
}
