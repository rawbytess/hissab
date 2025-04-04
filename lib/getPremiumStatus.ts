import { userMetadata } from "./types/userMetadata";

export function isPremiumUser(user: userMetadata) {
  if (!user?.subscription) return false;

  if (user.subscription.status === "expired") return false;
  if (user.subscription.status === "cancelled") {
    const endsAt = new Date(user.subscription.ends_at);
    const now = new Date();
    return endsAt > now;
  }
  //return false;
  return user.subscription.status === "active";
}
