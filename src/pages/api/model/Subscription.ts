import { AxiosInstance, isAxiosError } from 'axios';
import { model } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { JSDOM } from 'jsdom';

export class Subscription extends Item {
  sub_url!: string;
  work_url!: string;
  title!: string;
  image!: string;
  updated_at!: number;
  name!: string;
  rank!: number;
  has_new!: boolean;
}

export const SubscriptionModel = model<Subscription>(
  'specific-page-subscriber-subscription',
  {
    sub_url: String,
    work_url: String,
    title: String,
    image: String,
    updated_at: Number,
    name: String,
    rank: Number,
    has_new: Boolean,
  }
);

const UPDATE_FAILED_ERROR = {
  message:
    'The operation was failed, probably due to the invalid token' as const,
};
type UpdateFailedError = typeof UPDATE_FAILED_ERROR;

/** 与えられた購読情報を更新し保存したのち、購読を返す */
export async function updateSubscription(
  subscription: Subscription,
  client: AxiosInstance
) {
  try {
    const html = await client.get(subscription.sub_url);
    const gallery_document = new JSDOM(html.data).window.document;

    //本を取得
    const books = gallery_document.querySelectorAll('a.cover');
    if (!books) return subscription;

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
      return subscription;
    }
    return subscription;
  } catch (error) {
    if (isAxiosError(error) && error.code === '403') return UPDATE_FAILED_ERROR;
    return {
      message: `Unknown error occured during update operation for ${subscription.sub_url}\n${error}`,
    };
  }
}
