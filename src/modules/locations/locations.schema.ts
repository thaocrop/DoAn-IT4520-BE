import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { BaseSchema, Status } from 'src/base';

import { LocationType } from './locations.enum';

@Schema({
  timestamps: true,
})
class Locations extends BaseSchema {
  @Prop({ type: String })
  name?: string;

  @Prop({ type: Types.ObjectId })
  city_id?: string;

  @Prop({ type: Types.ObjectId })
  district_id?: string;

  @Prop({ type: String })
  codename: string;

  @Prop({ type: String, enum: Object.values(LocationType), default: LocationType.CITY })
  division_type: LocationType;

  @Prop({ type: String })
  short_codename: string;

  @Prop({ type: String })
  lat: string;

  @Prop({ type: String })
  lng: string;

  @Prop({ type: String, enum: Object.values(Status), default: Status.ACTIVE })
  status: Status;
}

const LocationsSchema = SchemaFactory.createForClass(Locations);
LocationsSchema.plugin(mongoosePaginate);
LocationsSchema.plugin(mongooseAggregatePaginate);

type LocationsDocument = Locations & Document;

export { LocationsSchema, Locations, LocationsDocument };
