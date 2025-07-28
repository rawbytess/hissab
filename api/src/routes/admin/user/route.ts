import { UserDB } from "@lib/db/UserDB";
import type { CreateUser, MetaBindings } from "@lib/types/envTypes";
import { getFormattedUtcDateString } from "@lib/utils";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import type { userMetadata } from "~lib/types/userMetadata";

const app = new Hono<MetaBindings>();

app.get("/:user_id", async (c) => {
  const user_id = c.req.param("user_id");
  const userdb = new UserDB(c.env.USER_DB);
  const user = userdb.getUserById(user_id);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user);
});

app.get("/", async (c) => {
  const searchParams = c.req.query();
  const email = searchParams.email as string;
  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }
  const userdb = new UserDB(c.env.USER_DB);
  const user = await userdb.getUserByEmail(email);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json(user);
});

app.post("/", async (c) => {
  const userData: CreateUser = await c.req.json();
  const userdb = new UserDB(c.env.USER_DB);
  const newUser = await userdb.createUser(
    userData.email,
    userData.demo ? "demo" : "unverified",
  );

  const user_id = newUser.id;
  const duration = {
    days: userData.expirationDays,
    months: userData.expirationMonths,
    years: userData.expirationYears,
  };
  const now = getFormattedUtcDateString();
  const expire = getFormattedUtcDateString(duration);

  if (userData.tier) {
    const eventID = nanoid(10);
    await userdb.insertUserPlan(
      eventID,
      user_id,
      "1234",
      now,
      expire,
      "1131919",
      userData.tier,
      "active",
    );
  }
  await userdb.updateUserName(user_id, userData.name);
  if (userData.demo)
    await userdb.insertDemoUser(user_id, userData.email, String(userData.demo), expire);

  return c.json({ user_id });
});

app.delete("/:user_id", async (c) => {
  const user_id = c.req.param("user_id");
  const userdb = new UserDB(c.env.USER_DB);
  await userdb.deleteUser(user_id);

  return c.json({ message: `User ${user_id} deleted successfully` });
});

export default app;
