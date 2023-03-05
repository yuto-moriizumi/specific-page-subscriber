import type { NextApiRequest, NextApiResponse } from 'next';
import dynamoose from 'dynamoose';
import { getDB } from './utils';
import { TOKEN_NAME } from './constant';
import { TokenModel } from './model/Token';

type Data =
  | Record<string, string>
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
  if (req.method === 'GET') {
    const token = await TokenModel.get(TOKEN_NAME);
    res.status(200).json({ token: token.value });
    return;
  } else if (req.method === 'PUT') {
    const token = await TokenModel.get(TOKEN_NAME);
    const data = req.body as { token: string };
    token.value = data.token;
    await token.save();
    res.status(204).end();
    return;
  }
  res.status(405).end();
}
