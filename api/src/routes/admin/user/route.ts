import { Hono } from "hono";
import { CreateUser, MetaBindings } from "@lib/types/envTypes";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";
import { userMetadata } from "~lib/types/userMetadata";
import { getFormattedUtcDateString } from "@lib/utils";
import { adminAuth } from "@middlewares/adminAuth";

const app = new Hono<MetaBindings>();
app.use(createSupabaseClient);
app.use(adminAuth);

app.get("/:user_id", async (c) => {
  const user_id = c.req.param("user_id");

  const { supabase } = c.var;
  return supabase.auth.admin.getUserById(user_id).then(({ data, error }) => {
    if (error) {
      console.error(`Error fetching user: ${user_id}`, error.message);
      return c.json({ error: error.message }, 500);
    }

    if (!data.user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json(data.user);
  });
});

app.get("/", async (c) => {
  const searchParams = c.req.query();
  const email = searchParams.email as string;
  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }
  const { supabase } = c.var;

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error(`Error fetching user by email: ${email}`, error.message);
    return c.json({ error: error.message }, 500);
  }
  if (!data) {
    return c.json({ error: "User not found" }, 404);
  }
  return supabase.auth.admin.getUserById(data.id).then(({ data, error }) => {
    if (error) {
      console.error(
        `Error fetching user metadata: ${data.user}`,
        error.message,
      );
      return c.json({ error: error.message }, 500);
    }
    return c.json(data.user.user_metadata as userMetadata);
  });
});

app.post("/", async (c) => {
  const userData: CreateUser = await c.req.json();
  const { supabase } = c.var;
  const newUser = await supabase.auth.admin.createUser({
    email: userData.email,
  });

  if (newUser.error) {
    console.error(
      `Error creating user with email ${userData.email}`,
      newUser.error.message,
      userData,
    );
    return c.json({ ok: true });
  }
  const user_id = newUser.data.user.id;
  const duration = {
    days: userData.expirationDays,
    months: userData.expirationMonths,
    years: userData.expirationYears,
  };
  const now = getFormattedUtcDateString();
  const expire = getFormattedUtcDateString(duration);

  if (userData.tier) {
    const { error: insertError } = await supabase.from("user_plan").insert({
      user_id,
      customer_id: 1234,
      created_at: now,
      ends_at: expire,
      renews_at: expire,
      updated_at: now,
      order_id: 12345,
      subscription_id: 1131919,
      product_name: userData.tier,
      variant_name: userData.tier,
      status: "active",
    });

    if (insertError) {
      console.error(
        `Error inserting user_plan: ${user_id}`,
        insertError.message,
      );
      return c.json({ error: insertError.message }, 500);
    }

    const userMetadata: userMetadata = {
      user_name: userData.name,
      timezone: userData.timezone,
      subscription: {
        status: "active",
        renews_at: expire,
        ends_at: expire,
        created_at: now,
        updated_at: now,
        product_name: userData.tier,
        variant_name: userData.tier,
      },
      lifetime: null,
    };
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      user_id,
      { user_metadata: userMetadata },
    );
    if (metaError) {
      console.error(
        `Error updating user metadata: ${user_id}`,
        metaError.message,
      );
      return c.json({ error: metaError.message }, 500);
    }
  }
  if (userData.demo) {
    const { error: demoError } = await supabase.from("test_emails").insert({
      id: user_id,
      email: userData.email,
      created_at: now,
      otp: userData.demo,
    });

    if (demoError) {
      console.error(`Error inserting demo user: ${user_id}`, demoError.message);
      return c.json({ error: demoError.message }, 500);
    }
  }
  return c.json({ user_id });
});

app.delete("/:user_id", async (c) => {
  const user_id = c.req.param("user_id");
  const { supabase } = c.var;

  if (!user_id) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id);

  if (deleteError) {
    console.error(`Error deleting user: ${user_id}`, deleteError.message);
    return c.json({ error: deleteError.message }, 500);
  }
  const { error: testEmailError } = await supabase
    .from("test_emails")
    .delete()
    .eq("id", user_id);
  if (testEmailError) {
    console.error(
      `Error deleting test email for user: ${user_id}`,
      testEmailError.message,
    );
    return c.json({ error: testEmailError.message }, 500);
  }

  return c.json({ message: `User ${user_id} deleted successfully` });
});

export default app;
