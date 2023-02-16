import type { NextApiRequest, NextApiResponse } from 'next';
import { aws, model } from 'dynamoose';
import { getDB } from '../utils';
import { TABLE_NAME } from '../constant';
import { Item } from 'dynamoose/dist/Item';

type Data =
  | {
      subscriptions: Record<string, object>[];
    }
  | {
      message: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const ddb = getDB();
  if (ddb === undefined) {
    res.status(500).json({ message: 'Access key is invalid' });
    return;
  }
  aws.ddb.set(ddb);
  const { url } = req.query;
  if (url === undefined || url instanceof Array) {
    res.status(400).json({ message: 'The specified url is invalid' });
    return;
  }
  const data = req.body as { rank?: number; has_new?: boolean };
  // const result = await ddb.updateItem({
  //   TableName: TABLE_NAME,
  //   Key: { sub_url: url },
  // });
  // res.status(200).json({ subscriptions: result.Items ?? [] });

  // Strongly typed model
  class Cat extends Item {
    id!: number;
    name!: string;
  }
  const CatModel = model<Cat>('Cat', { id: Number, name: String });

  // Will raise type checking error as random is not a valid field.
  CatModel.create({ id: 1, name: 'Hello' });

  // Will return the correct type of Cat
  const cat = await CatModel.get(1);
}
