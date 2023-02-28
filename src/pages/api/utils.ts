import axios from 'axios';
import { aws } from 'dynamoose';
import { AWS_REGION, TOKEN_NAME } from './constant';
import { SubscriptionModel } from './model/Subscription';
import { TokenModel } from './model/Token';

export const getDB = () => {
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  if (AWS_ACCESS_KEY_ID === undefined || AWS_SECRET_ACCESS_KEY === undefined) {
    return;
  }
  // Create new DynamoDB instance
  return new aws.ddb.DynamoDB({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: AWS_REGION,
  });
};

export const getAxiosClient = async () => {
  const token = await TokenModel.get(TOKEN_NAME);
  return axios.create({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0',
      Cookie: 'cf_clearance=' + token,
    },
  });
};
