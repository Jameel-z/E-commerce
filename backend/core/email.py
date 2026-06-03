import logging
from typing import Any
import resend

from .config import settings

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, token: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured — skipping verification email")
        return False

    resend.api_key = settings.RESEND_API_KEY
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Verify your email address</h2>
      <p>Click the button below to activate your account. The link expires in 24 hours.</p>
      <a href="{verify_url}"
         style="display:inline-block;padding:12px 24px;background:#1a4a8a;color:#fff;text-decoration:none;border-radius:6px">
        Verify Email
      </a>
      <p style="margin-top:20px;color:#666;font-size:13px">
        If you didn't create an account, you can ignore this email.
      </p>
    </div>
    """

    try:
        result = resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Verify your email address",
            "html": html,
        })
        logger.info("Verification email sent to %s — Resend ID: %s", to_email, result)
        return True
    except Exception as exc:
        logger.error("Failed to send verification email to %s: %s", to_email, exc)
        return False


def send_order_confirmation_email(order: Any, customer_email: str) -> bool:
    if not settings.RESEND_API_KEY or not customer_email:
        return False

    resend.api_key = settings.RESEND_API_KEY

    items_rows = "".join(
        f"""<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee">{item.product.name if item.product else f'Product #{item.product_id}'}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">{item.quantity}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${float(item.price_at_order):.2f}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${float(item.price_at_order) * item.quantity:.2f}</td>
            </tr>"""
        for item in (order.order_items or [])
    )

    total = sum(float(i.price_at_order) * i.quantity for i in (order.order_items or []))

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#222">
      <div style="background:#1a4a8a;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;color:#fff;font-size:20px">✅ Order Confirmed!</h2>
        <p style="margin:4px 0 0;color:#c8d8f0;font-size:13px">Order #{order.id} · 961shop.com</p>
      </div>

      <div style="background:#f9fafb;padding:20px 24px;border:1px solid #e5e7eb;border-top:none">

        <p style="margin:0 0 16px;font-size:14px">
          Hi <strong>{order.customer_name or 'there'}</strong>, your order has been placed successfully.
          We will contact you on WhatsApp at <strong>{order.customer_phone or '—'}</strong> to confirm delivery.
        </p>

        <!-- Delivery Info -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:14px 16px;margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:.05em">Delivery Details</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr>
              <td style="padding:4px 0;color:#555;width:120px">Address</td>
              <td style="padding:4px 0">{order.shipping_address or '—'}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#555">Governorate</td>
              <td style="padding:4px 0">{order.shipping_city or '—'}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#555">Payment</td>
              <td style="padding:4px 0">{(order.payment_method or 'cash').title()}</td>
            </tr>
          </table>
        </div>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#e5e7eb">
              <th style="padding:8px 12px;text-align:left">Product</th>
              <th style="padding:8px 12px;text-align:center">Qty</th>
              <th style="padding:8px 12px;text-align:right">Unit Price</th>
              <th style="padding:8px 12px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>{items_rows}</tbody>
          <tfoot>
            <tr style="background:#1a4a8a">
              <td colspan="3" style="padding:10px 12px;color:#fff;font-weight:700">Total</td>
              <td style="padding:10px 12px;color:#fff;font-weight:700;text-align:right">${total:.2f}</td>
            </tr>
          </tfoot>
        </table>

        {"<p style='margin:16px 0 0;font-size:13px;color:#555'><strong>Notes:</strong> " + order.notes + "</p>" if order.notes else ""}
      </div>

      <div style="padding:14px 24px;background:#f3f4f6;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#888;text-align:center">
        Thank you for shopping at <a href="https://961shop.com" style="color:#1a4a8a;text-decoration:none">961shop.com</a>
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [customer_email],
            "subject": f"Order #{order.id} Confirmed — Thank you for your purchase!",
            "html": html,
        })
        logger.info("Order confirmation sent to %s for order %s", customer_email, order.id)
        return True
    except Exception as exc:
        logger.error("Failed to send order confirmation to %s for order %s: %s", customer_email, order.id, exc)
        return False


def send_order_notification_email(order: Any) -> bool:
    if not settings.RESEND_API_KEY or not settings.ORDER_NOTIFICATION_EMAIL:
        return False

    resend.api_key = settings.RESEND_API_KEY

    items_rows = "".join(
        f"""<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee">{item.product.name if item.product else f'Product #{item.product_id}'}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">{item.quantity}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${float(item.price_at_order):.2f}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${float(item.price_at_order) * item.quantity:.2f}</td>
            </tr>"""
        for item in (order.order_items or [])
    )

    total = sum(float(i.price_at_order) * i.quantity for i in (order.order_items or []))

    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#222">
      <div style="background:#1a4a8a;padding:20px 24px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;color:#fff;font-size:20px">🛒 New Order #{order.id}</h2>
        <p style="margin:4px 0 0;color:#c8d8f0;font-size:13px">961shop.com</p>
      </div>

      <div style="background:#f9fafb;padding:20px 24px;border:1px solid #e5e7eb;border-top:none">

        <!-- Customer Info -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#555;width:140px">Customer</td>
            <td style="padding:6px 0;font-size:13px;font-weight:600">{order.customer_name or '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#555">Phone</td>
            <td style="padding:6px 0;font-size:13px;font-weight:600">{order.customer_phone or '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#555">Address</td>
            <td style="padding:6px 0;font-size:13px">{order.shipping_address or '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#555">Governorate</td>
            <td style="padding:6px 0;font-size:13px">{order.shipping_city or '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#555">Payment</td>
            <td style="padding:6px 0;font-size:13px">{(order.payment_method or 'cash').title()}</td>
          </tr>
          {"<tr><td style='padding:6px 0;font-size:13px;color:#555'>Notes</td><td style='padding:6px 0;font-size:13px'>" + order.notes + "</td></tr>" if order.notes else ""}
        </table>

        <!-- Items Table -->
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#e5e7eb">
              <th style="padding:8px 12px;text-align:left">Product</th>
              <th style="padding:8px 12px;text-align:center">Qty</th>
              <th style="padding:8px 12px;text-align:right">Unit Price</th>
              <th style="padding:8px 12px;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>{items_rows}</tbody>
          <tfoot>
            <tr style="background:#1a4a8a">
              <td colspan="3" style="padding:10px 12px;color:#fff;font-weight:700">Total</td>
              <td style="padding:10px 12px;color:#fff;font-weight:700;text-align:right">${total:.2f}</td>
            </tr>
          </tfoot>
        </table>

      </div>

      <div style="padding:14px 24px;background:#f3f4f6;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#888;text-align:center">
        This is an automated notification from 961shop.com
      </div>
    </div>
    """

    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [settings.ORDER_NOTIFICATION_EMAIL],
            "subject": f"New Order #{order.id} — {order.customer_name or 'Customer'} — ${total:.2f}",
            "html": html,
        })
        logger.info("Order notification sent for order %s", order.id)
        return True
    except Exception as exc:
        logger.error("Failed to send order notification for order %s: %s", order.id, exc)
        return False
