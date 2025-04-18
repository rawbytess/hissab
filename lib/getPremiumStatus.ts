import { userMetadata } from "./types/userMetadata";

export function isPremiumUser(user: userMetadata) {
  if (!user?.subscription) return false;
  if (user.subscription.status === "expired") return false;
  if (user.subscription.status === "cancelled") {
    const endsAt = new Date(user.subscription.ends_at!);
    const now = new Date();
    return endsAt > now;
  }
  //return false;
  return user.subscription.status === "active";
}

export function getMaxCharacterLimit(product: string) {
  if (product === "AI Lite") return 500;
  if (product === "AI Plus") return 1500;
  return 0;
}
