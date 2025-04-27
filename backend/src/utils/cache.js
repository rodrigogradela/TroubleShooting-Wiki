const memoryCache = new Map();
const CACHE_TTL = 3600 * 1000; // 1 hora em milissegundos

async function getCachedResults(query) {
  const key = `search:${query.toLowerCase()}`;
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    console.log(`Returning memory cached results for query: ${query}`);
    return cached.data;
  }
  return null;
}

async function setCachedResults(query, results) {
  const key = `search:${query.toLowerCase()}`;
  memoryCache.set(key, {
    data: results,
    expires: Date.now() + CACHE_TTL
  });
  console.log(`Cached results in memory for query: ${query}`);
}

module.exports = { getCachedResults, setCachedResults };