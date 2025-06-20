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
  // Twitter v2 returns { data: [ { text, ... } ] }
  const result = await client.v2.search(query, { max_results: 20 });
  // Always return an array of posts with a text property
  if (result && Array.isArray(result.data)) {
    return result.data;
  } else if (result && result.data) {
    return result.data;
  } else {
    return [];
  }
} 