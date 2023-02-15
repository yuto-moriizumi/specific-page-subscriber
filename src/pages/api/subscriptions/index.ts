import type { NextApiRequest, NextApiResponse } from "next";
import dynamoose from "dynamoose";

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = "ap-northeast-1";

type Data =
  | {
      names: string[];
    }
  | {
      message: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (AWS_ACCESS_KEY_ID === undefined || AWS_SECRET_ACCESS_KEY === undefined) {
    res.status(500).json({ message: "Access key is invalid" });
    return;
  }
  // Create new DynamoDB instance
  const ddb = new dynamoose.aws.ddb.DynamoDB({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: AWS_REGION,
  });
  // Set DynamoDB instance to the Dynamoose DDB instance
  dynamoose.aws.ddb.set(ddb);
  const result = await ddb.listTables({});
  res.status(200).json({ names: result.TableNames ?? [] });
}
