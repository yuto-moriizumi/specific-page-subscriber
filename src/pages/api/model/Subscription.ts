import { AxiosInstance } from 'axios';
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

  async update(client: AxiosInstance) {
    const html = await client.get(this.sub_url);
    const gallery_document = new JSDOM(html.data).window.document;

    //本を取得
    const books = gallery_document.querySelectorAll('a.cover');
    if (!books) return this;

    //最新の日本語本を見つける
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const book_url = new URL(this.sub_url).origin + book.getAttribute('href');
      const res_book = await client.get(book_url);
      const document = new JSDOM(res_book.data).window.document;

      const language = document.querySelector('section#tags')?.textContent; //言語を取得
      if (!language?.includes('japanese')) continue; //日本語でないなら次の本へ

      const title = document.querySelector('h2.title span.pretty')?.textContent; //タイトルを取得
      if (title === this.title) break; //更新が無ければ何もしない

      //作者を取得
      const author = document.querySelector(
        'h2.title span.before'
      )?.textContent;

      //情報を更新する
      this.name = author ?? '取得失敗';
      this.title = title ?? '取得失敗';
      this.image =
        book.querySelector('img')?.getAttribute('data-src') ?? 'undefined';
      this.updated_at = Date.now();
      this.has_new = true;
      this.save();
      return this;
    }
    return this;
  }
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

/** 与えられた購読情報を更新し保存したのち、購読を返す */
export async function updateSubscription(
  subscription: Subscription,
  client: AxiosInstance
) {
  const html = await client.get(subscription.sub_url);
  const gallery_document = new JSDOM(html.data).window.document;

  //本を取得
  const books = gallery_document.querySelectorAll('a.cover');
  if (!books) return;

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
    const author = document.querySelector('h2.title span.before')?.textContent;

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
}
