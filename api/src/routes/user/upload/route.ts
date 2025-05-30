import { Hono } from "hono";
import { Bindings, userVars } from "@lib/types/envTypes";
import { cors } from "hono/cors";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";
import { supabaseAppAuth } from "@middlewares/supabaseAppAuth";
import { zValidator } from "@hono/zod-validator";
import { getMaxFileSize, isPremiumUser } from "~lib/getPremiumStatus";
import { run } from "~lib/errors";
import { Gemini } from "@lib/ai/gemini";
import {
  FileUpload,
  supportedMimeTypes,
  zFileUpload,
} from "~lib/types/fileTypes";

const app = new Hono<{
  Bindings: Bindings;
  Variables: userVars;
}>();
app.use(cors());
app.use(createSupabaseClient);
app.use(supabaseAppAuth);

app.post("/", zValidator("json", zFileUpload), async (c) => {
  const { user, supabase } = c.var;
  const body = c.req.valid("json");
  const isPremium = isPremiumUser(user);
  if (!isPremium) {
    return c.body("Not a subscribed user", 403);
  }
  if (isPremium !== "AI Plus") {
    return c.body("Not subscribed to AI Plus", 403);
  }
  const geminiModel = new Gemini(c.env.GEMINI_API_KEY, "gemini-2.0-flash-lite");
  console.log(body);
  const fileRes = await supabase.storage
    .from("context")
    .download(`${user.user_id}/${body.name}`);
  if (fileRes.error) {
    console.error({ message: fileRes.error.message });
    return c.body("Error while fetching file", 500);
  }

  if (supportedMimeTypes.indexOf(fileRes.data.type) === -1) {
    return c.body("Unsupported mimetype", 500);
  }

  if (fileRes.data.size > getMaxFileSize(isPremium)) {
    return c.body("File size exceeds limit", 500);
  }

  const fileResult = await run(geminiModel.uploadFile(body, fileRes.data));
  if (fileResult.failed) {
    console.error({ message: fileResult.error.message });
    return c.body("Error while uploading file", 500);
  }
  if (fileResult.data.error) {
    console.error({ message: fileResult.data.error });
    return c.body("Error while uploading file", 500);
  }
  const respBody: FileUpload = {
    ...body,
    geminiFile: fileResult.data,
  };
  return c.json(respBody, 200);
});

export default app;
