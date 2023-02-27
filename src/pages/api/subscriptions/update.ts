import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from 'dynamoose';
import { getDB } from '../utils';
import { TOKEN_NAME } from '../constant';
import { TokenModel } from '../model/Token';
import { SubscriptionModel } from '../model/Subscription';
import axios from 'axios';
import { JSDOM } from 'jsdom';

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
  const token = await TokenModel.get(TOKEN_NAME);
  const subscriptions = await SubscriptionModel.scan().exec();

  const client = axios.create({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0',
      Cookie: 'cf_clearance=' + token,
    },
  });

  //各購読を直列に更新（API制限のため）
  for (const subscription of subscriptions) {
    const html = await client.get(subscription.sub_url);
    const gallery_document = new JSDOM(html.data).window.document;

    //本を取得
    const books = gallery_document.querySelectorAll('a.cover');
    if (!books) continue;

    //最新の日本語本を見つける
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const book_url =
        new URL(subscription.sub_url).origin + book.getAttribute('href');
      const res_book = await client.get(book_url);
      const document = new JSDOM(res_book.data).window.document;

      const language = document.querySelector('section#tags')?.textContent; //言語を取得
      if (!language?.includes('japanese')) continue; //日本語でないなら次の本へ

      const title = document.querySelector('h2.title span.pretty')?.textContent; //タイトルを取得
      if (title === subscription.title) break; //更新が無ければ何もしない

      //作者を取得
      const author = document.querySelector(
        'h2.title span.before'
      )?.textContent;

      //情報を更新する
      subscription.name = author ?? '取得失敗';
      subscription.title = title ?? '取得失敗';
      subscription.image =
        book.querySelector('img')?.getAttribute('data-src') ?? 'undefined';
      subscription.updated_at = Date.now();
      subscription.has_new = true;
      subscription.save();
      break;
    }
  }
  res.status(204);
}
