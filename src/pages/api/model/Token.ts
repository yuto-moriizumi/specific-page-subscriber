import { model } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

class Token extends Item {
  key!: string;
  value!: string;
}

export const TokenModel = model<Token>('specific-page-subscriber-config', {
  key: String,
  value: String,
});
