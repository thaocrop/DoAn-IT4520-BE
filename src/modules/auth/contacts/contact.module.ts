import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MONGO_CONNECTION_NAME } from '../database/database.const';
import { MerchantModule } from '../merchants/merchants.module';
import { PlanModule } from '../plans/plans.module';
import { UserModule } from '../users/users.module';

import { ConvertModule } from './../../shared/convert/convert.module';
import { NotificationsModule } from './../notifications/notifications.module';
import { ContactController } from './contact.controller';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';
import { Contact, ContactSchema } from './schemas/contacts.schema';

const dbSchemas = [
  {
    name: Contact.name,
    schema: ContactSchema,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature(dbSchemas, MONGO_CONNECTION_NAME),
    forwardRef(() => UserModule),
    forwardRef(() => MerchantModule),
    PlanModule,
    forwardRef(() => NotificationsModule),
    ConvertModule,
  ],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
  exports: [ContactService],
})
export class ContactsModule {}
