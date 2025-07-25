import { zValidator } from "@hono/zod-validator";
import { Gemini } from "@lib/ai/gemini";
import { UserDB } from "@lib/db/UserDB";
import type { Bindings, userVars } from "@lib/types/envTypes";
import { authMiddleware } from "@routes/user/ai/route";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { nanoid } from "nanoid";
import { run } from "~lib/errors";
import { getMaxFileSize, isPremiumUser } from "~lib/getPremiumStatus";
import {
  ALLOWED_MIME_TYPES,
  type FileUpload,
  supportedMimeTypes,
  zFileUpload,
} from "~lib/types/fileTypes";

const app = new Hono<{
  Bindings: Bindings;
  Variables: userVars;
}>();
app.use(
  cors({
    origin: [
      "https://hissab.app",
      "https://app.hissab.app",
      "http://localhost:5173",
    ],
    allowMethods: ["POST"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

app.post("/", authMiddleware, async (c) => {
  const { user } = c.var;
  const userdb = new UserDB(c.env.USER_DB);
  const plansdb = await userdb.getActiveUserPlans(user.sub);
  const plans = plansdb.map((p) => p.product_name);
  if (plans.length === 0) {
    return c.body("Not a subscribed user", 403);
  }
  if (!plans.includes("AI Plus")) {
    return c.body("Not subscribed to AI Plus", 403);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return c.json(
      { error: 'A file must be provided in the "file" field.' },
      400,
    );
  }

  // 1. Validate File Type
  if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
    return c.json(
      {
        error: `Invalid file type.`,
      },
      415,
    );
  }

  // 2. Validate File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return c.json(
      {
        error: `File is too large. The maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
      },
      413,
    );
  }

  /*
  // 3. Validate User Quota
  const quotaCheck = await checkUserQuota(
    user.user_id,
    c.env.FILES_R2_BUCKET,
    file.size,
  );
  if (!quotaCheck.ok) {
    return c.json({ error: quotaCheck.error }, 413);
  }
*/
  // Construct the unique key for the file in R2
  const key = `${user.sub}/f/${nanoid(5)}-${file.name}`;

  try {
    // Upload the file stream to the R2 bucket
    await c.env.FILES_R2_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const response = {
      name: file.name,
      mimeType: file.type,
      url: key,
    };

    return c.json(response, 201); // 201 Created
  } catch (e) {
    console.error("R2 Upload Error:", e);
    return c.json(
      { error: "An internal error occurred while trying to save the file." },
      500,
    );
  }
});

export default app;
