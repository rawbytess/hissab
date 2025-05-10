import { BACKEND_URL } from "@/lib/utils.ts";
import { supabase } from "@/lib/supabase/client.ts";
import { CustomError, fetchPost, run } from "../../../lib/errors.ts";
import { isPremiumUser } from "../../../lib/getPremiumStatus.ts";
import { userMetadata } from "../../../lib/types/userMetadata.ts";
import { FileUpload } from "../../../lib/types/fileTypes.ts";
import { getFileInfoFromUrl } from "@/lib/fileMetaData.ts";

export async function uploadFile(file: FileUpload) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data || !data.session || !data.session.user)
    throw new CustomError(
      "NotLoggedIn",
      error?.message ?? "No session found",
      "Subscribe to use AI features",
    );
  const user = isPremiumUser(data.session.user.user_metadata as userMetadata);
  if (!user && user !== "AI Plus")
    throw new CustomError(
      "NotSubscribed",
      "User not subscribed to AI Plus",
      "Subscribe to use AI features",
    );

  const responseResult = await run(
    fetchPost(`${BACKEND_URL}/user/upload`, file, {
      Authorization: `Bearer ${data?.session?.access_token}`,
      Refresh: data?.session?.refresh_token || "",
    }),
  );
  if (responseResult.failed) {
    throw new CustomError(
      "FetchResponse",
      responseResult.error.message,
      responseResult.error.userMessage,
    );
  }
  return responseResult.data as FileUpload;
}
