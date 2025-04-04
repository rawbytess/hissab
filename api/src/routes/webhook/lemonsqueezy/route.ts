import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { Bindings } from "@lib/types/envTypes";
import {
  zLSWebhook,
  zOrderObject,
  zSubscriptionObject,
} from "@lib/types/lemonSqueezyTypes";
import { lsWebhookAuth } from "@middlewares/lsWebhookAuth";
import { z } from "zod";
import { userMetadata } from "../../../../../lib/types/userMetadata";

type LSWebhook = z.infer<typeof zLSWebhook>;
const app = new Hono<{
  Bindings: Bindings;
  Variables: { body: LSWebhook };
}>();
app.use("/*", lsWebhookAuth);

function isSubscriptionObject(
  obj: LSWebhook,
): obj is z.infer<typeof zSubscriptionObject> {
  return obj.data.type === "subscriptions";
}

function isOrderObject(obj: LSWebhook): obj is z.infer<typeof zOrderObject> {
  return obj.data.type === "orders";
}

app.post("/", async (c) => {
  const bodyJson: LSWebhook = c.var.body;
  console.log(bodyJson);
  const supabase = createClient(
    c.env.SUPABASE_API_URL,
    c.env.SUPABASE_ADMIN_KEY,
  );
  if (
    isSubscriptionObject(bodyJson) &&
    bodyJson.meta.event_name === "subscription_updated"
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
    } = bodyJson.data.attributes;

    // console.log(bodyJson);
    console.log(user_email);

    const { data, error } = await supabase
      .from("users")
      .select(`id`)
      .eq("email", user_email)
      .single();
    if (error) {
      console.log(`Error fetching user with email ${user_email}`, error);
      return c.json({ error: "Error" }, 510);
    }

    const user_id = data.id;
    console.log(user_id);
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
      console.log(`Error inserting user_plan: ${user_id}`, error);
      return c.json({ error: "Error" }, 510);
    }
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      user_id,
      { user_metadata: userMetadata },
    );
    if (metaError) {
      console.log(`Error updating user metadata: ${user_id}`, error);
      return c.json({ error: "Error" }, 510);
    }
  }
  return c.json({ ok: true });
});

export default app;
