import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/shared/config/config.service';

import { LocationsRepository } from './locations.repository';

@Injectable()
export class LocationsService {
  constructor(private readonly repo: LocationsRepository, private configService: ConfigService) {}

  async getAll() {
    return await this.repo.findAll();
  }
}
