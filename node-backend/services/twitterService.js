import { TwitterApi } from 'twitter-api-v2';

export function getTwitterClient() {
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
}

export async function searchTweets(query) {
  const client = getTwitterClient();
  // This endpoint may require Elevated access
  const { data } = await client.v2.search(query, { max_results: 10 });
  return data;
} 