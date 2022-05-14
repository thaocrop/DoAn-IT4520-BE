import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';

import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('')
  async getAll() {
    return await this.locationsService.getAll();
  }
}
