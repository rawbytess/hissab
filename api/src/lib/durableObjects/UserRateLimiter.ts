import { DurableObject } from "cloudflare:workers";
import { Env } from "hono";
import { ProductNames } from "~lib/types/userMetadata";
import { modelRateLimits, ModelSize } from "~lib/types/AITypes";

export class UserRateLimiter extends DurableObject<Env> {
  sql: SqlStorage;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.sql = ctx.storage.sql;
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS rate_limit 
(id TIMESTAMP PRIMARY KEY, model text, count INTEGER);`,
    );
  }

  async checkRateLimit(
    isPremium: ProductNames,
    modelSize: ModelSize,
  ): Promise<boolean> {
    const today = getTodayTimestamp();
    const limit = modelRateLimits[modelSize][isPremium];
    if (limit === 0) {
      return false;
    }
    console.log("Checking rate limit", today, modelSize, limit);

    const currentCount = this.sql
      .exec(
        `SELECT count FROM rate_limit WHERE id = ? AND model = ?`,
        today,
        modelSize,
      )
      .toArray();
    console.log("Current count", currentCount);
    if (currentCount.length === 0) {
      this.sql.exec(
        `INSERT INTO rate_limit (id, model, count) VALUES (?, ?, ?)`,
        today,
        modelSize,
        0,
      );
      return true;
    }
    const count = currentCount[0].count as number;
    return count <= limit;
  }

  async resetRateLimitForModel(modelSize: ModelSize) {
    const today = getTodayTimestamp();
    console.log("Resetting rate limit for model", today, modelSize);
    this.sql.exec(
      `DELETE FROM rate_limit WHERE id = ? AND model = ?`,
      today,
      modelSize,
    );
  }
  async resetRateLimitForAllModels() {
    const today = getTodayTimestamp();
    console.log("Resetting rate limit for all models", today);
    this.sql.exec(`DELETE FROM rate_limit WHERE id = ?`, today);
  }
  async getRateLimitForModel(modelSize: ModelSize) {
    const today = getTodayTimestamp();
    const currentCount = this.sql
      .exec(
        `SELECT count FROM rate_limit WHERE id = ? AND model = ?`,
        today,
        modelSize,
      )
      .toArray();
    if (currentCount.length === 0) {
      return 0;
    }
    return currentCount[0].count as number;
  }
  async getRateLimitForAllModels() {
    const today = getTodayTimestamp();
    const currentCount = this.sql
      .exec(`SELECT * FROM rate_limit WHERE id = ?`, today)
      .toArray();
    return currentCount;
  }

  async incrementRateLimit(isPremium: ProductNames, modelSize: ModelSize) {
    const today = getTodayTimestamp();
    const limit = modelRateLimits[modelSize][isPremium];
    if (limit === 0) {
      return;
    }

    const currentCount = this.sql
      .exec(
        `SELECT count FROM rate_limit WHERE id = ? AND model = ?`,
        today,
        modelSize,
      )
      .toArray();

    if (currentCount.length === 0) {
      this.sql.exec(
        `INSERT INTO rate_limit (id, model, count) VALUES (?, ?, ?)`,
        today,
        modelSize,
        1,
      );
      return;
    }
    const count = currentCount[0].count as number;
    if (count >= limit) {
      throw new Error("Rate limit exceeded");
    }
    this.sql.exec(
      `UPDATE rate_limit SET count = ? WHERE id = ? AND model = ?`,
      count + 1,
      today,
      modelSize,
    );
  }
}

// get sqlite timestamp for today's date
export function getTodayTimestamp(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

// get sqlite timestamp for this hour
export function getThisHourTimestamp(): string {
  const today = new Date();
  return today.toISOString().split("T")[0] + " " + today.getHours() + ":00:00";
}
