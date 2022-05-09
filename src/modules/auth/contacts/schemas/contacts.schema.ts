import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { BaseSchema } from 'src/base/base.schema';
import { Status } from 'src/enum/base.enum';
import { Merchants } from 'src/modules/merchants/schema/merchants.schema';

@Schema({
  timestamps: true,
})
class Contact extends BaseSchema {
  @Prop({ type: SchemaTypes.ObjectId, required: false })
  userId?: Types.ObjectId;

  @Prop({ type: String })
  fullName: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, default: Status.ACTIVE, enum: Object.values(Status) })
  status: Status;

  @Prop({ type: Number })
  contacts: number;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: () => Merchants })
  merchant: Merchants;
}

const ContactSchema = SchemaFactory.createForClass(Contact);
ContactSchema.plugin(mongoosePaginate);
ContactSchema.plugin(mongooseAggregatePaginate);

type ContactDocument = Contact & Document;

export { ContactSchema, Contact, ContactDocument };
