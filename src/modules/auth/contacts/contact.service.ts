import { ConvertService } from 'src/shared/convert/convert.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorHelper } from 'src/utils/error.utils';
import { Status } from 'src/enum/base.enum';
import { listArrayByDateRange } from 'src/utils/date';

import { MerchantService } from '../merchants/merchants.service';
import {
  CONTACT_NOT_FOUND,
  MERCHANT_NOT_FOUND,
  CONTACT_CREATE_SUCCESS,
  CONTACT_UPDATE_SUCCESS,
  CONTACT_DELETE_SUCCESS,
  CONTACT_DUPLICATE_SUCCESS,
  USER_NOT_EXIST,
  EMAIL_ALREADY_EXISTS,
  PHONE_ALREADY_EXISTS,
  USER_ALDREADY_EXIST,
  MERGE_SETTINGS_MISS_MATCH,
  MEMBERSHIP_TIER_NOT_FOUND,
  FILE_WRONG,
  FILE_TYPE_WRONG,
  PLAN_MISS_FEATURE,
} from '../../messages/auth.message';
import { UserService } from '../users/users.service';
import { PlanService } from '../plans/plans.service';
import { MerchantDocument } from '../merchants/schema/merchants.schema';
import { membershipUpdate } from '../notifications/constant';

import { IFindEmailOrCreate } from './contact.interface';
import { CreateNotificationDto } from './../notifications/dto/create-notification.dto';
import { NotiTitle } from './../notifications/enum/notifications.enum';
import { NotiTypeEnum } from './../../enum/base.enum';
import { NotificationsService } from './../notifications/notifications.service';
import { ContactSortValues } from './enums/contact.enum';
import { Contact, ContactDocument } from './schemas/contacts.schema';
import { ContactRepository } from './contact.repository';
import {
  CreatContactDto,
  GetListMergeSuggestionDto,
  MergeContactDto,
  SearchContactReqDto,
  UpdateContactDto,
  UpdateUserMembershipTierDto,
} from './dto/contact.dto';
@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    private readonly repo: ContactRepository,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => MerchantService))
    private merchantService: MerchantService,
    private planService: PlanService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationService: NotificationsService,
    private convertService: ConvertService,
  ) {
    // softDeletePlugin(AdminSchema);
  }

  async createContact(owner, params: CreatContactDto) {
    try {
      const { fullName, phoneNumber, email } = params;
      const { merchantId } = owner;
      //WHAT: check user permission to create
      await this._permissionCreateContacts(owner);
      const merchant = await this.merchantService.findById(merchantId);
      const contact = await this.repo.create({
        merchant,
        fullName,
        phoneNumber,
        email,
      });
      // const user = await this.userService.findOne({
      //   email: email,
      //   merchantId: merchant._id,
      //   userType: UserType.CLIENT,
      // });
      // if (user && !user.contactId) {
      //   await this.userService.updateById(user._id, { contactId: contact._id });
      // }
      return {
        contact,
        message: CONTACT_CREATE_SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  }

  async duplicateContact(owner, id: string) {
    const contact = await this.repo.findById(id);
    if (!contact) {
      ErrorHelper.BadRequestException(CONTACT_NOT_FOUND);
    }
    await this._permissionCreateContacts(owner);

    const newContact = await this.repo.create({
      merchant: contact.merchant,
      fullName: `${contact.fullName} copy`,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
    });
    return {
      contact: await this.getById(newContact._id),
      message: CONTACT_DUPLICATE_SUCCESS,
    };
  }

  async getListContact(user, query: SearchContactReqDto) {
    try {
      const { merchantId } = user;
      const { page, limit, search, sortBy, sortField } = query;
      const sortByValue = ContactSortValues.DESC === sortBy ? -1 : 1 || null;
      const options: any = {
        limit: limit ? Number(limit) : 10,
        page: page ? Number(page) : 1,
        sort: {
          [`${sortField}`]: sortByValue,
        },
      };
      const merchant = await this.merchantService.findById(merchantId);

      const res = await this.repo.getListContactPaging(merchant._id, options, search);
      return res;
    } catch (error) {
      ErrorHelper.InternalServerErrorException(error);
    }
  }

  async updateContact(contactId: string, params: UpdateContactDto, user) {
    const contact = await this.repo.findById(contactId);
    let isSameEmail = false;
    const { merchantId } = user;
    const { phoneNumber, email } = params;
    if (!contact) {
      ErrorHelper.BadRequestException(CONTACT_NOT_FOUND);
    }
    if (email === contact.email || phoneNumber === contact.phoneNumber) {
      isSameEmail = true;
    }
    if (email && !isSameEmail) {
      const _contact = await this.repo.findOne({
        email: email,
        'merchant._id': new Types.ObjectId(merchantId),
      });
      if (_contact) {
        const user = await this.userService.findOne({
          contactId: _contact._id,
          merchantId: new Types.ObjectId(merchantId),
        });
        if (user) {
          ErrorHelper.BadRequestException(EMAIL_ALREADY_EXISTS);
        }
      }
    }
    if (phoneNumber && !isSameEmail) {
      const _contact = await this.repo.findOne({
        phoneNumber: phoneNumber,
        'merchant._id': new Types.ObjectId(merchantId),
      });
      if (_contact) {
        const user = await this.userService.findOne({
          contactId: _contact._id,
          merchantId: new Types.ObjectId(merchantId),
        });
        if (user) {
          ErrorHelper.BadRequestException(PHONE_ALREADY_EXISTS);
        }
      }
    }
    const updateContact = await this.repo.updateOne({ _id: contactId }, params);

    return {
      contact: updateContact,
      message: CONTACT_UPDATE_SUCCESS,
    };
  }

  // TODO: apply transaction
  async deleteContact(user, contactId: string) {
    try {
      const { merchantId } = user;
      const contact = await this.repo.findOne({ _id: contactId, 'merchant._id': merchantId });
      if (!contact) {
        ErrorHelper.BadRequestException(CONTACT_NOT_FOUND);
      }

      await Promise.all([this.userService.deleteUser({ contactId }), this.repo.removeAll({ _id: contact._id })]);

      return {
        message: CONTACT_DELETE_SUCCESS,
      };
    } catch (error) {
      ErrorHelper.InternalServerErrorException(error);
    }
  }

  async findOne(filter) {
    return this.contactModel.findOne(filter);
  }

  async getById(id: string) {
    const res = await this.repo.getContactById(id);
    if (!res.length) {
      ErrorHelper.BadRequestException(CONTACT_NOT_FOUND);
    }
    return res[0];
  }

  async totalContacsEachDate(merchantId) {
    let contact = 0;
    const reportList = [];

    const aggQuery = [
      {
        $match: {
          'merchant._id': merchantId,
          status: Status.ACTIVE,
        },
      },
      {
        $group: {
          _id: { day: { $dayOfYear: '$createdAt' }, year: { $year: '$createdAt' } },
          value: { $sum: 1 },
          date: { $min: '$createdAt' },
        },
      },
      { $sort: { date: 1 } },
    ];
    //@ts-ignore
    const listContacts = await this.repo.getModel().aggregate(aggQuery);
    listContacts.forEach(({ date, value }) => {
      contact += value;
      reportList.push({ date, value: contact });
    });
    return listArrayByDateRange(reportList);
  }

  async getContactsByAggregate(aggQuery) {
    const listContacts = await this.repo.getModel().aggregate(aggQuery);
    return listContacts;
  }

  async listMergeSeggestions(user, params: GetListMergeSuggestionDto) {
    const { merchantId } = user;
    const { page, limit } = params;

    const options = {
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
    };
    const merchant = await this.merchantService.findById(merchantId);
    const match = merchant?.mergeSettings?.match;
    if (!match) {
      ErrorHelper.BadRequestException(MERGE_SETTINGS_MISS_MATCH);
    }
    const emailCondition = merchant?.mergeSettings?.isEmail
      ? [{ $and: [{ $eq: ['$email', '$$email'] }, { $ne: [{ $ifNull: ['$email', null] }, null] }] }]
      : [];
    const telCondition = merchant?.mergeSettings?.isTel
      ? [{ $and: [{ $eq: ['$phoneNumber', '$$phoneNumber'] }, { $ne: [{ $ifNull: ['$phoneNumber', null] }, null] }] }]
      : [];
    const filterByMergeSetting = {
      [`$${match}`]: [...emailCondition, ...telCondition],
    };
    // aggregate
    const aggQuery = [
      {
        $match: {
          $and: [{ status: Status.ACTIVE }, { 'merchant._id': merchant._id }],
        },
      },
      {
        $lookup: {
          from: 'contacts',
          let: { email: '$email', createdAt: '$createdAt', phoneNumber: '$phoneNumber' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { ...filterByMergeSetting },
                    { $eq: ['$status', Status.ACTIVE] },
                    {
                      $gt: ['$createdAt', '$$createdAt'],
                    },
                  ],
                },
                userId: { $in: [null, undefined] },
              },
            },
          ],
          as: 'resourceUser',
        },
      },
      { $unwind: '$resourceUser' },
      {
        $lookup: {
          from: 'users',
          let: { id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$contactId', '$$id'] }],
                },
              },
            },
          ],
          as: 'users',
        },
      },
      {
        $addFields: { userContact: { $arrayElemAt: ['$users', 0] } },
      },
      {
        $addFields: {
          avatar: '$userContact.avatar',
        },
      },
      {
        $project: {
          merchant: 0,
          _user: 0,
          'resourceUser.merchant': 0,
          users: 0,
          userContact: 0,
        },
      },
    ];
    // return aggQuery;
    if (!filterByMergeSetting[`$${match}`].length) {
      return this.repo.paginate({ status: { $nin: Object.values(Status) } }, options);
    }
    //@ts-ignore
    const aggregateModel = this.repo.getModel().aggregate(aggQuery);
    return this.repo.getAggModel().aggregatePaginate(aggregateModel, options);
  }

  async mergeContacts(user, params: MergeContactDto) {
    const { merchantId } = user;
    const { suggestions } = params;
    const merchant = await this.merchantService.findById(merchantId);
    if (!merchant.mergeSettings) {
      ErrorHelper.BadRequestException(MERCHANT_NOT_FOUND);
    }
    for (const suggestion of suggestions) {
      const { resourceId, targetId } = suggestion;
      const { _id, ...args } = await this.repo.findById(targetId, {
        projection: { email: 1, phoneNumber: 1, fullName: 1, _id: 1 },
      });
      const { email, phoneNumber, fullName, _id: resContactId } = await this.repo.findById(resourceId);
      await this.repo.updateById(_id, {
        email,
        phoneNumber,
        fullName,
        ...args,
      });
      await this.repo.updateById(resContactId, { status: Status.DELETED });
    }
    return true;
  }

  async _permissionCreateContacts(owner) {
    const { merchantId, planId } = owner;
    const plan = await this.planService.findById(planId);
    if (!plan) {
      ErrorHelper.BadRequestException(PLAN_MISS_FEATURE);
    }
    if (!plan.contact.status) {
      return true;
    }
    //WHAT: check max plan contact
    const maxContact = plan.contact?.limit;
    const totalContact = await this.repo.getTotalContact(merchantId);
    if (maxContact && totalContact >= maxContact) {
      ErrorHelper.BadRequestException(`This plan only provide feature create max ${maxContact} contact`);
    }
    return true;
  }

  async findByEmailOrCreate(params: IFindEmailOrCreate, merchant: MerchantDocument) {
    const { email } = params;
    const contact = await this.repo.findOne({ email, 'merchant._id': merchant._id, status: { $ne: Status.DELETED } });
    if (!contact) {
      return await this.repo.create({
        ...params,
        merchant,
        status: Status.ACTIVE,
      });
    }
    const user = await this.userService.findOne({
      contactId: contact?._id,
      merchantId: merchant._id,
      status: Status.ACTIVE,
    });
    if (user) {
      ErrorHelper.BadRequestException(USER_ALDREADY_EXIST);
    }
    return contact;
  }

  async findByPhoneOrCreate(params: any, merchant: MerchantDocument) {
    const { phoneNumber } = params;
    const contact = await this.repo.findOne({
      phoneNumber,
      'merchant._id': merchant._id,
      status: { $ne: Status.DELETED },
    });
    if (!contact) {
      return await this.repo.create({
        ...params,
        merchant,
        status: Status.ACTIVE,
      });
    }
    const user = await this.userService.findOne({
      contactId: contact?._id,
      merchantId: merchant._id,
      status: Status.ACTIVE,
    });
    if (user) {
      ErrorHelper.BadRequestException(USER_ALDREADY_EXIST);
    }
    return contact;
  }

  async findByUserOrCreate(params: Partial<Contact>) {
    const { phoneNumber, email, merchant, status } = params;
    const contactByEmail = await this.repo.findOne({
      email: { $ne: null, $eq: email },
      'merchant._id': merchant._id,
      status: { $ne: Status.DELETED },
    });

    const contactByPhone = await this.repo.findOne({
      phoneNumber: { $ne: null, $eq: phoneNumber },
      'merchant._id': merchant._id,
      status: { $ne: Status.DELETED },
    });

    if (!contactByEmail && !contactByPhone) {
      return await this.repo.create({
        ...params,
        merchant,
        status: status ?? Status.INACTIVE,
      });
    }

    const userByEmail = await this.userService.findOne({
      contactId: { $ne: null, $eq: contactByEmail?.id },
      merchantId: merchant._id,
    });

    const userByPhone = await this.userService.findOne({
      contactId: { $ne: null, $eq: contactByPhone?.id },
      merchantId: merchant._id,
    });

    if (userByEmail || userByPhone) {
      ErrorHelper.BadRequestException(USER_ALDREADY_EXIST);
    }

    if (contactByEmail) {
      return contactByEmail;
    }

    return contactByPhone;
  }

  async updateMembershipTier(params: UpdateUserMembershipTierDto, user) {
    const { merchantId } = user;
    const { userId, membershipTierId } = params;
    const merchant = await this.merchantService.findById(merchantId);

    const memberTier = merchant.membershipTiers.find(_membershipTier => {
      return _membershipTier._id.toString() === membershipTierId;
    });

    if (!memberTier) {
      ErrorHelper.BadRequestException(MEMBERSHIP_TIER_NOT_FOUND);
    }
    const _user = await this.userService.findOne({ _id: new Types.ObjectId(userId), merchantId: merchant._id });
    if (!_user) {
      ErrorHelper.BadRequestException(USER_NOT_EXIST);
    }
    const membershipTier = {
      tierId: memberTier._id,
      initPoint: memberTier.pointThreshold ?? 0,
      tierName: memberTier.membershipName,
      color: memberTier?.color,
      initDate: new Date(),
      accumulativePoints: memberTier.pointThreshold ?? 0,
      bahtSpent: memberTier?.bahtSpent,
      iconUrl: memberTier?.iconUrl,
    };
    const updatedUser = await this.userService.updateById(_user._id, {
      memberTier: membershipTier,
    });

    const oldMemberTier = merchant.membershipTiers.find(_membershipTier => {
      return _membershipTier._id.toString() === _user.memberTier.tierId.toString();
    });

    const isUpgrade = memberTier.pointThreshold > oldMemberTier.pointThreshold;

    //notification
    const notiData: CreateNotificationDto = {
      merchantId: user.merchantId,
      title: NotiTitle.MEMBERSHIP_CHANGE,
      body: membershipUpdate(_user.fullName, _user.memberTier?.tierName, updatedUser.memberTier?.tierName, isUpgrade),
      type: NotiTypeEnum.MEMBERSHIP_CHANGE,
    };

    this.notificationService.sendNotificationToMerchant(notiData);
    return updatedUser;
  }

  async updateById(id: string, params: any) {
    return this.repo.updateById(id, params);
  }

  async findById(id: Types.ObjectId | string) {
    return this.repo.findById(id.toString());
  }

  /**
   * Export contact data to excel
   * @author   James.nguyen
   * @param    {string} merchantId merchant Id
   * @return   {} file
   */
  async exportContact(user) {
    try {
      const { merchantId } = user;
      //WHAT: check merchant id
      await this.merchantService.findById(merchantId);

      //WHAT: get list contact by merchant Id
      const contacts = await this.repo.getListContactAgg(merchantId);
      //WHAT: handle data to excel file
      return await this.convertService.contact2excel({ data: contacts });
    } catch (error) {
      ErrorHelper.InternalServerErrorException(error);
    }
  }

  /**
   * import contact from excel file
   * @author   James.nguyen
   * @param    {string} merchantId merchant id
   * @param    {Express.Multer.File} file excel contact file
   * @return   {status} ok
   */
  async importContact(merchantId: string, file: Express.Multer.File) {
    if (!file) {
      ErrorHelper.BadRequestException(FILE_WRONG);
    }
    if (!file?.originalname?.match(/\.(csv|xlsx)$/)) {
      ErrorHelper.BadRequestException('File type not match');
    }
    //WHAT: import merchant
    const merchant = await this.merchantService.findById(merchantId);

    const data = await this.convertService.excel2Contact(file, merchant);

    if (data.status) {
      const contacts = data.contacts;
      return this.repo.insertMany(contacts);
    } else {
      ErrorHelper.BadRequestException(FILE_TYPE_WRONG);
    }
  }

  /**
   * Export template contact data excel file
   * @author   James.nguyen
   * @return   {} file
   */
  async downloadTemplate() {
    return await this.convertService.excelTemplate();
  }
}
//
