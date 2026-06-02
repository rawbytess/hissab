import type { ProductNames, userMetadata } from "./types/userMetadata";

export function isPremiumUser(
  user: userMetadata | undefined | null,
): ProductNames | null {
  if (!user?.subscription) return null;
  if (user.subscription.status === "expired") return null;
  if (user.subscription.status === "cancelled") {
    const endsAt = new Date(user.subscription.ends_at!);
    const now = new Date();
    return endsAt > now ? user.subscription.product_name : null;
  }

  return user.subscription.status === "active"
    ? user.subscription.product_name
    : null;
}

export function getMaxCharacterLimit(product: string) {
  if (product === "AI Lite") return 500;
  if (product === "AI Plus") return 1500;
  return 0;
}

export function getMaxFileSize(product: string) {
  if (product === "AI Plus") return 1024 * 1024 * 10; // 10MB
  return 0;
}
