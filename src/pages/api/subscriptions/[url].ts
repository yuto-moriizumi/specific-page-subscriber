import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from 'dynamoose';
import { getDB } from '../utils';
import { Subscription, SubscriptionModel } from '../model/Subscription';

type Data =
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
  aws.ddb.set(ddb);
  const { url: rawUrl } = req.query;
  if (rawUrl === undefined || rawUrl instanceof Array) {
    res.status(400).json({ message: 'The specified url is invalid' });
    return;
  }
  const url = decodeURI(rawUrl);
  if (req.method === 'PATCH') {
    const subscription = await SubscriptionModel.get(url);
    const data = req.body as { rank?: number; has_new?: boolean };
    subscription.rank = data.rank ?? subscription.rank;
    subscription.has_new = data.has_new ?? subscription.has_new;
    await subscription.save();
    res.status(204).end();
    return;
  } else if (req.method === 'DELETE') {
    const subscription = await SubscriptionModel.get(url);
    await subscription.delete();
    res.status(204).end();
    return;
  }
  res.status(405).end();
}
