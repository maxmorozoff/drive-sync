import dotenv from "dotenv";
dotenv.config();

export const env = process.env;

export function createCachedFunction(originalFunction) {
  const cache = new Map();
  return async function cachedFunction(...args) {
    const cacheKey = JSON.stringify(args);
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    const result = await originalFunction(...args);
    cache.set(cacheKey, result);
    return result;
  };
}

export function getGoogleServiceKey() {
  if (env.GOOGLE_SERVICE_CLIENT_EMAIL && env.GOOGLE_SERVICE_PRIVATE_KEY) {
    return {
      client_email: env.GOOGLE_SERVICE_CLIENT_EMAIL,
      // 
      // https://github.com/auth0/node-jsonwebtoken/issues/642
      private_key: env.GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    };
  }
  if (!env.GOOGLE_SERVICE_CREDENTIALS)
    throw new Error("Missing GOOGLE_SERVICE_CREDENTIALS");
  const secrets = JSON.parse(
    Buffer.from(env.GOOGLE_SERVICE_CREDENTIALS ?? "", "base64").toString()
  );
  return {
    client_email: secrets.client_email,
    private_key: secrets.private_key,
  };
}

export const DEBUG = env.DEBUG_SYNC_GDRIVE ?? !true;
export const log = (() =>
  DEBUG ? (...args) => console.log(...args) : () => {})();
