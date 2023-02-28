import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from 'dynamoose';
import { getAxiosClient, getDB } from '../utils';
import {
  Subscription,
  SubscriptionModel,
  updateSubscription,
} from '../model/Subscription';

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
  const { url } = req.query;
  if (url === undefined || url instanceof Array) {
    res.status(400).json({ message: 'The specified url is invalid' });
    return;
  }

  if (req.method === 'POST') {
    const data = req.body as Subscription;
    const client = await getAxiosClient();
    const subscription = await new SubscriptionModel(data).update(client);
    // const subscription = await updateSubscription(rawSubscription, client);
    res.status(204).json(subscription);
    return;
  } else if (req.method === 'PATCH') {
    const subscription = await SubscriptionModel.get(url);
    const data = req.body as { rank?: number; has_new?: boolean };
    subscription.rank = subscription.rank ?? data.rank;
    subscription.has_new = subscription.has_new ?? data.has_new;
    await subscription.save();
    res.status(204);
    return;
  } else if (req.method === 'DELETE') {
    const subscription = await SubscriptionModel.get(url);
    await subscription.delete();
    res.status(204);
    return;
  }
  res.status(405);
}
