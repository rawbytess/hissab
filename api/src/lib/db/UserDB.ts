import { config } from "@lib/config";
import { nanoid } from "nanoid";
import {
  type DemoUser,
  type User,
  UserMetadata,
  type UserPlan,
  type UserStatus,
} from "~lib/types/userMetadata";

export class UserDB {
  d1: D1Database;
  constructor(d1: D1Database) {
    this.d1 = d1;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.d1
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();
  }

  async createUser(
    email: string,
    status: UserStatus = "unverified",
  ): Promise<User> {
    const newUserId = nanoid(30);
    await this.d1
      .prepare("INSERT INTO users (id, email, status) VALUES (?, ?, ?)")
      .bind(newUserId, email, status)
      .run();
    return {
      id: newUserId,
      email,
      status,
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.d1
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(userId)
      .first();
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await this.d1
      .prepare("UPDATE users SET status = ? WHERE id = ?")
      .bind(status, userId)
      .run();
  }

  async insertOtp(
    userId: string,
    otp: string,
    expiresAt: string,
  ): Promise<void> {
    await this.d1
      .prepare(
        "INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
      )
      .bind(userId, otp, expiresAt)
      .run();
  }

  async getOtp(
    userId: string,
  ): Promise<{ id: number; otp_code: string; expires_at: string } | null> {
    return await this.d1
      .prepare(
        "SELECT id, otp_code, expires_at FROM otps WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
      )
      .bind(userId, new Date().toISOString())
      .first<{ id: number; otp_code: string; expires_at: string }>();
  }

  async updateUserName(userId: string, name: string): Promise<void> {
    await this.d1
      .prepare("UPDATE users SET name = ? WHERE id = ?")
      .bind(name, userId)
      .run();
  }

  async deleteOtp(optID: number): Promise<void> {
    await this.d1.prepare("DELETE FROM otps WHERE id = ?").bind(optID).run();
  }

  async createRefreshToken(userId: string, token: string): Promise<void> {
    const refreshTokenExpiresAt = new Date(
      Date.now() + config.auth.refreshTokenExpiration * 1000,
    ).toISOString();
    await this.d1
      .prepare(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      )
      .bind(userId, token, refreshTokenExpiresAt)
      .run();
  }

  async getRefreshToken(
    userId: string,
  ): Promise<{ token: string; expires_at: string } | null> {
    return await this.d1
      .prepare(
        "SELECT token, expires_at FROM refresh_tokens WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC LIMIT 1",
      )
      .bind(userId, new Date().toISOString())
      .first<{ token: string; expires_at: string }>();
  }

  async getTokenRecord(
    token: string,
  ): Promise<{ user_id: string; expires_at: string } | null> {
    return await this.d1
      .prepare(
        "SELECT user_id, expires_at FROM refresh_tokens WHERE token = ? AND expires_at > ?",
      )
      .bind(token, new Date().toISOString())
      .first<{ user_id: string; expires_at: string }>();
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.d1
      .prepare("DELETE FROM refresh_tokens WHERE user_id = ?")
      .bind(userId)
      .run();
  }

  async insertUserPlan(
    eventId: string,
    userId: string,
    customerId: string,
    createdAt: string,
    endsAt: string,
    subscriptionId: string | null,
    productName: string,
    status: string,
  ): Promise<void> {
    await this.d1
      .prepare(
        "INSERT INTO user_plan (id, user_id, customer_id, created_at, ends_at, renews_at, updated_at, " +
          "subscription_id, product_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        eventId,
        userId,
        customerId,
        createdAt,
        endsAt,
        null,
        null,
        subscriptionId,
        productName,
        status,
      )
      .run();
  }

  async getUserPlans(userId: string): Promise<UserPlan[]> {
    const result = await this.d1
      .prepare("SELECT * FROM user_plan WHERE user_id = ?")
      .bind(userId)
      .all();
    return result.results as UserPlan[];
  }

  async getActiveUserPlans(userId: string): Promise<UserPlan[]> {
    const currentDate = new Date().toISOString();
    const result = await this.d1
      .prepare(
        "SELECT * FROM user_plan WHERE user_id = ? AND (ends_at IS NULL OR ends_at > ?)",
      )
      .bind(userId, currentDate)
      .all();
    return result.results as UserPlan[];
  }

  async getDemoUserById(userId: string): Promise<DemoUser | null> {
    return await this.d1
      .prepare("SELECT * FROM demo_users WHERE id = ?")
      .bind(userId)
      .first();
  }

  async insertDemoUser(
    userId: string,
    email: string,
    otp: string,
    expiresAt: string,
  ): Promise<void> {
    await this.d1
      .prepare(
        "INSERT INTO demo_users (id,email, otp, expires_at) VALUES (?,?, ?, ?)",
      )
      .bind(userId, email, otp, expiresAt)
      .run();
  }

  async deleteUser(userId: string): Promise<void> {
    await this.d1.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
  }
}
