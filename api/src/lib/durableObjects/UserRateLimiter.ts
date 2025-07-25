import { DurableObject } from "cloudflare:workers";
import {
  Bindings,
  type MetaBindings,
  type RateLimitStorage,
  userVars,
} from "@lib/types/envTypes";
import { getTodayTimestamp } from "~lib/timeutils";
import { type ModelSize, Models, modelRateLimits } from "~lib/types/AITypes";
import type { ProductNames } from "~lib/types/userMetadata";

export class UserRateLimiter extends DurableObject<MetaBindings> {
  async checkRateLimit(
    plans: ProductNames[],
    modelSize: ModelSize,
    timezone: string,
    userId: string,
  ): Promise<boolean> {
    const today = getTodayTimestamp();
    const isPremium = plans.includes("AI Plus") ? "AI Plus" : "AI Lite";
    const limit = modelRateLimits[modelSize][isPremium];
    if (limit === 0) {
      return false;
    }
    this.ctx.storage.put("userId", userId);
    const currentCount: RateLimitStorage = (await this.ctx.storage.get(
      `${today}-${modelSize}`,
    )) || { count: 0, timezone, model: modelSize };
    if (currentCount.count === 0) {
      this.ctx.storage.put(`${today}-${modelSize}`, {
        count: 0,
        timezone,
        model: modelSize,
      } as RateLimitStorage);
    }
    return currentCount.count <= limit;
  }

  async getRateLimitForAllModels() {
    const today = getTodayTimestamp();
    const allModels = Object.keys(modelRateLimits) as ModelSize[];
    const rateLimitData: RateLimitStorage[] = [];
    for (const model of allModels) {
      const currentCount: RateLimitStorage = (await this.ctx.storage.get(
        `${today}-${model}`,
      )) as RateLimitStorage;
      if (currentCount) {
        rateLimitData.push(currentCount);
      }
    }
    return rateLimitData;
  }

  async incrementRateLimit(
    plans: ProductNames[],
    modelSize: ModelSize,
    timezone: string,
  ) {
    const today = getTodayTimestamp();
    const isPremium = plans.includes("AI Plus") ? "AI Plus" : "AI Lite";
    const limit = modelRateLimits[modelSize][isPremium];
    if (limit === 0) {
      return;
    }
    const currentCount: RateLimitStorage = (await this.ctx.storage.get(
      `${today}-${modelSize}`,
    )) as RateLimitStorage;
    if (currentCount.count === 0) {
      this.ctx.storage.put(`${today}-${modelSize}`, {
        count: 0,
        timezone,
        model: modelSize,
      } as RateLimitStorage);
    }
    this.ctx.storage.put(`${today}-${modelSize}`, {
      count: currentCount.count + 1,
      timezone,
      model: modelSize,
    } as RateLimitStorage);
  }
}
