import { model } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export class Subscription extends Item {
  sub_url!: string;
  work_url!: string;
  title!: string;
  image!: string;
  updated_at!: number;
  name!: string;
  rank!: number;
  has_new!: boolean;
}

export const SubscriptionModel = model<Subscription>('Subscription', {
  sub_url: String,
  work_url: String,
  title: String,
  image: String,
  updated_at: Number,
  name: String,
  rank: Number,
  has_new: Boolean,
});
