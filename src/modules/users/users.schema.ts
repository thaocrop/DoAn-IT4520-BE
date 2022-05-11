import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { BaseSchema, Status } from 'src/base';

import { UserType } from './users.enum';

@Schema({
  timestamps: true,
})
class Users extends BaseSchema {
  @Prop({ type: String })
  user_name?: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: String, enum: Object.values(Status), default: Status.ACTIVE })
  status?: Status;

  @Prop({ type: String, enum: Object.values(UserType), default: UserType.CLIENT })
  user_type?: UserType;
}

const UserSchema = SchemaFactory.createForClass(Users);
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

type UserDocument = Users & Document;

export { UserSchema, Users, UserDocument };
