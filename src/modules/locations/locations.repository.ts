import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'src/base';

import { Locations, LocationsDocument } from './locations.schema';

@Injectable()
export class LocationsRepository extends BaseRepository<Locations, LocationsDocument> {
  constructor(@InjectModel(Locations.name) model: any) {
    super(model, model);
  }
}
