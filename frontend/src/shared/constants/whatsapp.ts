export const WHATSAPP_CONFIG = {
  businessNumber: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER!,
  businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Our Store",
  messageTemplate: {
    header: "🛒 *Order Request*",
    itemsHeader: "📋 *Items:*",
    footer: `Thank you! Please confirm this order and enter the following details:
- Your name:
- Phone number:
- Delivery address:

Payment: Cash on Delivery 💳`,
  },
};
