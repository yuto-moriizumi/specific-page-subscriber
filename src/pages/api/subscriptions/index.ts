import type { NextApiRequest, NextApiResponse } from 'next';
import dynamoose, { model, Table } from 'dynamoose';
import { getDB } from '../utils';
import { TABLE_NAME } from '../constant';
import { Subscription, SubscriptionModel } from '../model/Subscription';

export type Data =
  | {
      subscriptions: Subscription[];
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
  dynamoose.aws.ddb.set(ddb);
  const result = await SubscriptionModel.scan().exec();

  res.status(200).json({ subscriptions: result.slice() ?? [] });
}
