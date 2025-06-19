import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export async function fetchFemaUpdates() {
  const url = 'https://www.fema.gov/disaster-feed';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const updates = [];
  // Example selector, adjust as needed for real FEMA feed
  $('item').each((i, el) => {
    updates.push({
      title: $(el).find('title').text(),
      link: $(el).find('link').text()
    });
  });
  return updates;
} 