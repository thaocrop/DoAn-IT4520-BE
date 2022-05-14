import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { BaseSchema, Status } from 'src/base';

@Schema({
  timestamps: true,
})
class Posts extends BaseSchema {
  @Prop({ type: Types.ObjectId })
  user_id: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: String })
  image_url: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String })
  short_description: string;

  @Prop({ type: String, enum: Object.values(Status), default: Status.INACTIVE })
  status: Status;
}

const PostsSchema = SchemaFactory.createForClass(Posts);
PostsSchema.plugin(mongoosePaginate);
PostsSchema.plugin(mongooseAggregatePaginate);

type PostsDocument = Posts & Document;

export { PostsSchema, Posts, PostsDocument };
