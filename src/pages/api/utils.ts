import axios from 'axios';
import { aws } from 'dynamoose';
import { AWS_REGION, TOKEN_NAME } from './constant';
import { TokenModel } from './model/Token';

export const getDB = () => {
  const ACCESS_KEY_ID = process.env.DB_ACCESS_KEY_ID;
  const SECRET_ACCESS_KEY = process.env.DB_SECRET_ACCESS_KEY;
  if (ACCESS_KEY_ID === undefined || SECRET_ACCESS_KEY === undefined) {
    return;
  }
  // Create new DynamoDB instance
  return new aws.ddb.DynamoDB({
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
    region: AWS_REGION,
  });
};

export const getAxiosClient = async () => {
  const token = await TokenModel.get(TOKEN_NAME);
  return axios.create({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
      Cookie: 'cf_clearance=' + token.value,
    },
  });
};
