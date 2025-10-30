import { WHATSAPP_CONFIG } from "@/shared/constants/whatsapp";
import { Cart } from "@/features/cart/types/cart.types";

export const generateWhatsAppOrderMessage = (cart: Cart): string => {
  const { messageTemplate } = WHATSAPP_CONFIG;

  // Format items
  const itemsList = cart.items
    .map(
      (item) =>
        `• ${item.product.name} - Qty: ${item.quantity} - $${parseFloat(
          item.product.price
        ).toFixed(2)} each`
    )
    .join("\n");

  // Calculate totals
  let total = cart.items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shipping = total > 50 ? 0 : 5.0;
  total = total + shipping;

  // Build message
  const message = `${messageTemplate.header}

${messageTemplate.itemsHeader}
${itemsList}

🚚 *Shipping: ${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}*
💵 *Total: $${total.toFixed(2)}*

${messageTemplate.footer}`;

  return message;
};

export const openWhatsApp = (message: string): void => {
  const { businessNumber } = WHATSAPP_CONFIG;
  const encodedMessage = encodeURIComponent(message);

  // Detect mobile vs desktop
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const whatsappUrl = isMobile
    ? `whatsapp://send?phone=${businessNumber}&text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${businessNumber}&text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};
