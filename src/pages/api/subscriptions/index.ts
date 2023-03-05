import type { NextApiRequest, NextApiResponse } from 'next';
import dynamoose from 'dynamoose';
import { getAxiosClient, getDB } from '../utils';
import {
  Subscription,
  SubscriptionModel,
  updateSubscription,
} from '../model/Subscription';

export type Data =
  | {
      subscriptions: Subscription[];
    }
  | Subscription
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

  if (req.method === 'POST') {
    const data = req.body as Subscription;
    const client = await getAxiosClient();
    const subscription = await updateSubscription(
      new SubscriptionModel(data),
      client
    );
    if ('message' in subscription) {
      res.status(500).json(subscription);
      return;
    }
    res.status(200).json(subscription);
    return;
  }

  const result = await SubscriptionModel.scan().exec();

  res.status(200).json({ subscriptions: result.slice() ?? [] });
}
