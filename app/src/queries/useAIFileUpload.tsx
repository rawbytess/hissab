import { useAuth } from "@/components/user/auth/AuthProvider.tsx";
import { getFileInfoFromUrl } from "@/lib/fileMetaData.ts";
import { BACKEND_URL, fetchPost } from "@/lib/utils.ts";
import { CustomError, run } from "../../../lib/errors.ts";
import { isPremiumUser } from "../../../lib/getPremiumStatus.ts";
import type { FileUpload } from "../../../lib/types/fileTypes.ts";
import { userMetadata } from "../../../lib/types/userMetadata.ts";

export async function uploadFile(file: FileUpload) {
  const { user, isAuthenticated, isPremium } = useAuth();
  if (!isAuthenticated)
    throw new CustomError(
      "NotLoggedIn",
      "No session found",
      "Subscribe to use AI features",
    );
  if (!user && isPremium !== "AI Plus")
    throw new CustomError(
      "NotSubscribed",
      "User not subscribed to AI Plus",
      "Subscribe to use AI features",
    );

  const responseResult = await run(
    fetchPost(`${BACKEND_URL}/user/upload`, file),
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
