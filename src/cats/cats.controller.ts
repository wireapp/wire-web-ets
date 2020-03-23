import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {InstanceCreationOptions} from '../instance/InstanceCreationOptions';
import {NewInstanceResponse} from '../instance/NewInstanceResponse';
import {CatsService} from './cats.service';
import {Cat} from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post(':id')
  @ApiResponse({status: 201, type: NewInstanceResponse})
  async createInstance(@Param('id') id: number, @Body() body: InstanceCreationOptions): Promise<NewInstanceResponse> {
    return {
      instanceId: '',
      name: body.name || '',
    };
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
