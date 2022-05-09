import { Status } from 'src/enum/base.enum';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { PaginateOptions } from 'mongoose';

import { BaseRepository } from '../../base/base.repository';
import { QrTableTypeEnum } from '../qr-table/enum/qr-table.enum';
import { TypeEnum } from '../points/enum/points.enum';

import { escapeRegExp } from './../../helpers/helpers';
import { Contact, ContactDocument } from './schemas/contacts.schema';
import { ExchangedTypeEnum, HistoryTypeEnum } from './../histories/enum/histories.enum';

@Injectable()
export class ContactRepository extends BaseRepository<Contact, ContactDocument> {
  constructor(@InjectModel(Contact.name) contactModel) {
    super(contactModel, contactModel);
  }

  async getTotalContact(merchantId: string) {
    return await this.countDocuments({
      'merchant._id': merchantId,
    });
  }

  async getContactById(id: string) {
    const aggQuery = [
      {
        $match: {
          _id: id,
          status: Status.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'contactId',
          as: 'users',
        },
      },
      {
        $addFields: { user: { $arrayElemAt: ['$users', 0] } },
      },
      {
        $lookup: {
          from: 'points',
          let: { userId: '$user._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    {
                      $or: [
                        { $eq: ['$expiredDate', -1] },
                        {
                          $gte: [
                            '$expiredDate',
                            moment()
                              .utc()
                              .toDate()
                              .getTime(),
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { stock_item: 0, _id: 0 } },
          ],
          as: 'points',
        },
      },
      {
        $lookup: {
          from: 'points',
          let: {
            userId: '$user._id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    {
                      $lte: [
                        '$expiredDate',
                        moment()
                          .add(1, 'months')
                          .toDate()
                          .getTime(),
                      ],
                    },
                    {
                      $ne: ['$expiredDate', -1],
                    },
                  ],
                },
              },
            },
          ],
          as: 'expiredPointsOneMonth',
        },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            userId: '$user._id',
            merchantId: '$user.merchantId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$userId', '$$userId'] }, { $eq: ['$merchantId', '$$merchantId'] }],
                },
              },
            },
          ],
          as: 'histories',
        },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            userId: '$user._id',
            merchantId: '$user.merchantId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$merchantId', '$$merchantId'] },
                    { $eq: ['$status', Status.ACTIVE] },
                    { $eq: ['$exchangedType', ExchangedTypeEnum.RECEIVED] },
                  ],
                },
              },
            },
            { $project: { stock_item: 0, _id: 0 } },
          ],
          as: 'couponBalance',
        },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            userId: '$user._id',
            merchantId: '$user.merchantId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$merchantId', '$$merchantId'] },
                    { $eq: ['$status', Status.ACTIVE] },
                    { $eq: ['$exchangedType', ExchangedTypeEnum.REDEEMED] },
                  ],
                },
              },
            },
          ],
          as: 'couponUsed',
        },
      },
      {
        $lookup: {
          from: 'histories',
          let: {
            userId: '$user._id',
            merchantId: '$user.merchantId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$merchantId', '$$merchantId'] },
                    { $eq: ['$status', Status.ACTIVE] },
                    { $eq: ['$exchangedType', ExchangedTypeEnum.RECEIVED] },
                    {
                      $lte: [
                        '$endDate',
                        moment()
                          .add(1, 'months')
                          .toDate()
                          .getTime(),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'expiredCouponsOneMonth',
        },
      },
      {
        $set: {
          'user.points.totalPoints': {
            $reduce: {
              input: '$points',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.balance'] },
            },
          },
          'user.points.expiredPointsOneMonth': {
            $reduce: {
              input: '$expiredPointsOneMonth',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.balance'] },
            },
          },
          'user.points.lastCollectionDate': {
            $reduce: {
              input: {
                $filter: {
                  input: '$histories',
                  as: 'e',
                  cond: {
                    $and: [
                      { $eq: ['$$e.exchangedType', ExchangedTypeEnum.RECEIVED] },
                      { $eq: ['$$e.type', HistoryTypeEnum.FREE_POINT] },
                    ],
                  },
                },
              },
              initialValue: '',
              in: '$$this.createdAt',
            },
          },
          'user.points.lastRedemptionDate': {
            $reduce: {
              input: {
                $filter: {
                  input: '$histories',
                  as: 'e',
                  cond: {
                    $and: [
                      { $eq: ['$$e.exchangedType', ExchangedTypeEnum.REDEEMED] },
                      { $eq: ['$$e.type', HistoryTypeEnum.FREE_POINT] },
                    ],
                  },
                },
              },
              initialValue: '',
              in: '$$this.createdAt',
            },
          },
        },
      },
      {
        $set: {
          'user.coupons.balance': { $size: '$couponBalance' },
          'user.coupons.used': { $size: '$couponUsed' },
          'user.coupons.expiredCouponsOneMonth': { $size: '$expiredCouponsOneMonth' },
          'user.coupons.lastCollectionDate': {
            $reduce: {
              input: {
                $filter: {
                  input: '$histories',
                  as: 'e',
                  cond: {
                    $and: [
                      { $eq: ['$$e.exchangedType', ExchangedTypeEnum.RECEIVED] },
                      { $eq: ['$$e.type', HistoryTypeEnum.COUPON] },
                    ],
                  },
                },
              },
              initialValue: '',
              in: '$$this.createdAt',
            },
          },
          'user.coupons.lastRedemptionDate': {
            $reduce: {
              input: {
                $filter: {
                  input: '$histories',
                  as: 'e',
                  cond: {
                    $and: [
                      { $eq: ['$$e.exchangedType', ExchangedTypeEnum.REDEEMED] },
                      { $eq: ['$$e.type', HistoryTypeEnum.COUPON] },
                    ],
                  },
                },
              },
              initialValue: '',
              in: '$$this.createdAt',
            },
          },
        },
      },
      {
        $set: {
          'user.sales.totalSales': {
            $reduce: {
              input: '$points',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.sale'] },
            },
          },
          'user.sales.salesLastDate': {
            $reduce: {
              input: {
                $filter: {
                  input: '$points',
                  as: 'e',
                  cond: {
                    $and: [{ $ne: ['$$e.sale', 0] }],
                  },
                },
              },
              initialValue: '',
              in: '$$this.createdAt',
            },
          },
        },
      },
      {
        $project: {
          users: 0,
          points: 0,
          'user.hashPassword': 0,
        },
      },
      {
        $lookup: {
          from: 'usedCouponUsers',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$userId', '$$userId'] }],
                },
              },
            },
          ],
          as: 'usedCouponUsers',
        },
      },
      {
        $lookup: {
          from: 'merchants',
          let: { merchantId: '$merchant._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$_id', '$$merchantId'] }],
                },
              },
            },
          ],
          as: 'merchants',
        },
      },
      {
        $addFields: {
          merchant: { $arrayElemAt: ['$merchants', 0] },
        },
      },
      {
        $lookup: {
          from: 'qrtables',
          let: {
            merchantId: '$user.merchantId',
            trafficSourceIds: '$user.trafficSourceIds',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$merchantId', '$$merchantId'] },
                    { $eq: ['$type', QrTableTypeEnum.TRAFFIC] },
                    { $eq: ['$status', Status.ACTIVE] },
                    { $in: ['$_id', { $ifNull: ['$$trafficSourceIds', []] }] },
                  ],
                },
              },
            },
            {
              $project: {
                name: 1,
                _id: 1,
              },
            },
          ],
          as: 'trafficSources',
        },
      },
      {
        $set: {
          validMembershipTiers: {
            $filter: {
              input: '$merchant.membershipTiers',
              as: 'e',
              cond: {
                $and: [
                  { $eq: ['$$e.status', true] },
                  { $gt: ['$$e.pointThreshold', '$user.memberTier.accumulativePoints'] },
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          'user.pointsToNextTier': {
            $cond: {
              if: { $eq: ['$validMembershipTiers', []] },
              then: {},
              else: { $arrayElemAt: ['$validMembershipTiers', 0] },
            },
          },
        },
      },
      {
        $project: {
          histories: 0,
          __v: 0,
          couponUsed: 0,
          couponBalance: 0,
          usedCouponUsers: 0,
          expiredPointsOneMonth: 0,
          merchants: 0,
          validMembershipTiers: 0,
          updatedAt: 0,
        },
      },
    ];
    //@ts-ignore
    return await this.getModel().aggregate(aggQuery);
  }

  /**
   * Get list contact of aggregate
   * @author   James.nguyen
   * @param    {string} merchantId merchant id
   * @param    {string} search Search key word
   * @return   {ContactDocument[]} contacts
   */
  getListContactAgg(merchantId: string, search?: string) {
    const searchCond = search && {
      $or: [
        {
          fullName: { $regex: escapeRegExp(search), $options: 'i' },
        },
        {
          phoneNumber: { $regex: escapeRegExp(search) },
        },
      ],
    };
    const aggQuery = [
      {
        $match: {
          $and: [
            { status: Status.ACTIVE },
            { 'merchant._id': merchantId },
            {
              ...searchCond,
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'contactId',
          as: 'users',
        },
      },
      {
        $addFields: { user: { $arrayElemAt: ['$users', 0] } },
      },
      {
        $lookup: {
          from: 'points',
          let: { merchantId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$merchantId', '$$merchantId'] },
                    {
                      $or: [
                        { $eq: ['$expiredDate', -1] },
                        {
                          $gte: [
                            '$expiredDate',
                            moment()
                              .utc()
                              .toDate()
                              .getTime(),
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: 'points',
        },
      },
      {
        $set: {
          'user.points': {
            $reduce: {
              input: '$points',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.balance'] },
            },
          },
        },
      },
      {
        $set: {
          'user.sales': {
            $reduce: {
              input: {
                $filter: {
                  input: '$points',
                  as: 'e',
                  cond: {
                    $and: [
                      {
                        $gt: ['$$e.sale', 0],
                      },
                      {
                        $eq: ['$$e.type', TypeEnum.GIVEN],
                      },
                    ],
                  },
                },
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.sale'] },
            },
          },
        },
      },
      {
        $project: {
          users: 0,
          points: 0,
          'user.hashPassword': 0,
        },
      },
    ];

    //@ts-ignore
    return this.getModel().aggregate(aggQuery);
  }

  /**
   * Get list contact with paging
   * @author   James.nguyen
   * @param    {string} merchantId merchant id
   * @param    {PaginateOptions} options any paging options
   * @param    {string} search Search key word
   * @return   {AggregatePaginateResult<ContactDocument>} contacts
   */
  async getListContactPaging(merchantId: string, options: PaginateOptions, search: string) {
    const aggregateModel = this.getListContactAgg(merchantId, search);
    const res = await this.getAggModel().aggregatePaginate(aggregateModel, options);
    return res;
  }
}
