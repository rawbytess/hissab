import context from "./context";
import { UnhandledError } from "./exceptions";

interface rateCacheIf {
  [key: string]: {
    rates: {
      [key: string]: number;
    };
    expiration: number;
  };
}

const ratesCache: rateCacheIf = {};

function clearRateCache() {
  Object.getOwnPropertyNames(ratesCache).forEach((p) => {
    delete ratesCache[p];
  });
}

async function getRate(srcUnit: string, date: string | undefined) {
  let key = srcUnit;
  if (date) key += `:${date}`;
  const dt = Math.round(Date.now() / 1000);
  if (Object.hasOwn(ratesCache, key) && ratesCache[key].expiration > dt)
    return ratesCache[key].rates;

  let url = `${context.financeURL}/?base=${srcUnit}`;
  if (date) url += `&date=${date}`;

  try {
    const resp = await fetch(url);
    const { rates, expiration } = (await resp.json()) as {
      rates: {};
      expiration: number;
    };
    const rateKeys: string[] = Object.keys(rates);
    const rateLowered: {
      [key: string]: number;
    } = {};
    rateKeys.forEach((r: string) => {
      // @ts-ignore
      rateLowered[r.toLowerCase()] = rates[r];
    });
    ratesCache[key] = { rates: rateLowered, expiration: expiration + dt };
    return rateLowered;
  } catch (e) {
    throw new UnhandledError(5331);
  }
}

export { getRate, clearRateCache };
