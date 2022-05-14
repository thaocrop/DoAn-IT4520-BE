import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_CONNECTION_NAME } from 'src/database';

import { LocationsController } from './locations.controller';
import { LocationsRepository } from './locations.repository';
import { Locations, LocationsSchema } from './locations.schema';
import { LocationsService } from './locations.service';

const dbSchemas = [
  {
    name: Locations.name,
    schema: LocationsSchema,
  },
];

@Module({
  imports: [MongooseModule.forFeature(dbSchemas, MONGO_CONNECTION_NAME)],
  controllers: [LocationsController],
  providers: [LocationsService, LocationsRepository],
  exports: [LocationsService],
})
export class LocationsModule {}
