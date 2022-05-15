import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class BaseSchema {
  @Prop({ type: Types.ObjectId })
  _id?: IObjectId;

  @Prop({ type: String })
  __v?: string;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export type IObjectId = Types.ObjectId | string;
