export type userMetadata = {
  user_name: string;
  subscription: {
    status:
      | "on_trial"
      | "active"
      | "paused"
      | "cancelled"
      | "past_due"
      | "expired";
    renews_at: string;
    ends_at: string;
    created_at: string;
    updated_at: string;
    product_name: "AI Lite" | "AI Plus" | string;
    variant_name: string;
  };
  lifetime:
    | [
        {
          product_name: string;
          variant_name: string;
          created_at: string;
          updated_at: string;
        },
      ]
    | null;
};
