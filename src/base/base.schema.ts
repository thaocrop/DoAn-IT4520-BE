import { Types } from 'mongoose';

export class BaseSchema {
  _id?: Types.ObjectId;
  __v?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IObjectId = Types.ObjectId | string;
