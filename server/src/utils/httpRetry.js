import axios from 'axios';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** GET with retries on 429 (rate limit). */
export async function axiosGetWithRetry(url, options = {}, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get(url, options);
    } catch (err) {
      lastError = err;
      if (err.response?.status === 429 && attempt < maxRetries) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
