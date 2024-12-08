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

export { clearRateCache };
