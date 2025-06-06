import { Hono } from "hono";
import { Bindings, lsVars } from "@lib/types/envTypes";
import {
  LSWebhook,
  OrderObject,
  SubscriptionObject,
  zLSWebhook,
} from "@lib/types/lemonSqueezyTypes";
import { lsWebhookAuth } from "@middlewares/lsWebhookAuth";
import { userMetadata } from "~lib/types/userMetadata";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";

const app = new Hono<{
  Bindings: Bindings;
  Variables: lsVars;
}>();
app.use(lsWebhookAuth);
app.use(zValidator("json", zLSWebhook));
app.use(createSupabaseClient);

function isSubscriptionObject(obj: LSWebhook): obj is SubscriptionObject {
  return obj.data.type === "subscriptions";
}

function isOrderObject(obj: LSWebhook): obj is OrderObject {
  return obj.data.type === "orders";
}

app.post("/", async (c) => {
  const { body, supabase } = c.var;

  if (
    isSubscriptionObject(body) &&
    body.meta.event_name === "subscription_updated"
  ) {
    const {
      customer_id,
      user_email,
      ends_at,
      first_subscription_item,
      created_at,
      order_id,
      product_name,
      variant_name,
      status,
      renews_at,
      updated_at,
      user_name,
    } = body.data.attributes;
    let newUser;

    const { data, error } = await supabase
      .from("users")
      .select(`id`)
      .eq("email", user_email)
      .single();
    if (error) {
      newUser = await supabase.auth.admin.createUser({
        email: user_email,
      });

      if (newUser.error) {
        console.error(
          `Error creating user with email ${user_email}`,
          newUser.error.message,
          body,
        );
        return c.json({ ok: true });
      }
    }

    const user_id = data?.id ?? newUser?.data?.user?.id;
    const { subscription_id } = first_subscription_item;
    const { error: insertError } = await supabase.from("user_plan").insert({
      user_id,
      customer_id,
      created_at,
      ends_at,
      renews_at,
      updated_at,
      order_id,
      subscription_id,
      product_name,
      variant_name,
      status,
    });

    const userMetadata: userMetadata = {
      user_name,
      timezone: "",
      subscription: {
        status,
        renews_at,
        ends_at,
        created_at,
        updated_at,
        product_name,
        variant_name,
      },
      lifetime: null,
    };
    if (insertError) {
      console.error(
        `Error inserting user_plan: ${user_id}`,
        insertError.message,
        body,
      );
      return c.json({ ok: true });
    }
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      user_id,
      { user_metadata: userMetadata },
    );
    if (metaError) {
      console.error(
        `Error updating user metadata: ${user_id}`,
        metaError.message,
        body,
      );
      return c.json({ ok: true });
    }
  }
  return c.json({ ok: true });
});

export default app;
