import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { BaseSchema, Status, IObjectId } from 'src/base';

import { Locations } from '../locations';

@Schema({
  timestamps: true,
})
class Comment extends BaseSchema {
  @Prop({ type: String })
  user_name: string;

  @Prop({ type: String })
  comment: string;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({
  timestamps: true,
})
class Posts extends BaseSchema {
  @Prop({ type: Types.ObjectId })
  user_id: IObjectId;

  @Prop({ type: String })
  user_name: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: Locations })
  location: Locations;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  image_url: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Number, default: 0 })
  like: number;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ type: [Number], default: [] })
  rates: number[];

  @Prop({ type: Number, default: 100 })
  rate: number;

  @Prop({ type: String })
  short_description: string;

  @Prop({ type: String, enum: Object.values(Status), default: Status.INACTIVE })
  status: Status;
}

const PostsSchema = SchemaFactory.createForClass(Posts);
PostsSchema.index({
  startLocation: '2dsphere',
});
PostsSchema.plugin(mongoosePaginate);
PostsSchema.plugin(mongooseAggregatePaginate);

type PostsDocument = Posts & Document;

export { PostsSchema, Posts, PostsDocument };
