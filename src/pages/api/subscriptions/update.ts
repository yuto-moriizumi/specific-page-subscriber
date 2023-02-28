import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from 'dynamoose';
import { getAxiosClient, getDB } from '../utils';
import { SubscriptionModel, updateSubscription } from '../model/Subscription';

type Data = {
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
  const client = await getAxiosClient();
  const subscriptions = await SubscriptionModel.scan().exec();
  //各購読を直列に更新（API制限のため）
  for (const subscription of subscriptions) {
    await updateSubscription(subscription, client);
  }
  res.status(204);
}
