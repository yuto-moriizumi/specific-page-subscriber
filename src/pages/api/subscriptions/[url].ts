import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from 'dynamoose';
import { getDB } from '../utils';
import { SubscriptionModel } from '../Subscription';

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
  const subscription = await SubscriptionModel.get(url);
  if (req.method === 'PATCH') {
    const data = req.body as { rank?: number; has_new?: boolean };
    subscription.rank = subscription.rank ?? data.rank;
    subscription.has_new = subscription.has_new ?? data.has_new;
    await subscription.save();
    res.status(204);
  } else if (req.method === 'DELETE') {
    await subscription.delete();
    res.status(204);
  }
  res.status(405);
}
