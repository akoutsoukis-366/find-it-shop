import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface OrderStatusEmailRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: string;
  items: Array<{ name: string; quantity: number; price?: number }>;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippingAddress?: ShippingAddress;
}

const getEmailContent = (
  status: string, 
  customerName: string, 
  orderId: string, 
  items: Array<{ name: string; quantity: number; price?: number }>,
  trackingNumber?: string,
  trackingUrl?: string,
  estimatedDelivery?: string,
  shippingAddress?: ShippingAddress
) => {
  const itemsList = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: #1a1a1a; font-weight: 500;">${item.name}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
        ×${item.quantity}
      </td>
    </tr>
  `).join('');

  const formatAddress = (addr: ShippingAddress): string => {
    const parts = [
      addr.line1,
      addr.line2,
      [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '),
      addr.country
    ].filter(Boolean);
    return parts.join('<br>');
  };

  const addressSection = shippingAddress
    ? `
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <div style="display: flex; align-items: flex-start;">
          <span style="font-size: 20px; margin-right: 12px;">📍</span>
          <div>
            <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Shipping To</div>
            <div style="font-size: 14px; color: #1a1a1a; line-height: 1.6;">${formatAddress(shippingAddress)}</div>
          </div>
        </div>
      </div>
    `
    : '';

  const trackingSection = trackingNumber 
    ? `
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; border-radius: 12px; margin: 24px 0; color: white;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 24px; margin-right: 12px;">📦</span>
          <span style="font-size: 18px; font-weight: 600;">Track Your Package</span>
        </div>
        <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px;">Tracking Number</div>
          <div style="font-family: 'SF Mono', Monaco, monospace; font-size: 18px; font-weight: 600; letter-spacing: 1px;">${trackingNumber}</div>
        </div>
        ${trackingUrl ? `
          <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: white; color: #2563eb; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Track Package →
          </a>
        ` : ''}
      </div>
    `
    : '';

  const deliverySection = estimatedDelivery
    ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin: 24px 0;">
        <div style="display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 12px;">🚚</span>
          <div>
            <div style="font-size: 12px; color: #16a34a; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Estimated Delivery</div>
            <div style="font-size: 16px; color: #166534; font-weight: 600;">${estimatedDelivery}</div>
          </div>
        </div>
      </div>
    `
    : '';
  
  if (status === 'shipped') {
    return {
      subject: `🚀 Your order #${orderId.slice(0, 8).toUpperCase()} is on its way!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 700; font-size: 20px; letter-spacing: -0.5px;">
                iTag
              </div>
            </div>

            <!-- Main Card -->
            <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Your Order Has Shipped!</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Great news, ${customerName || 'there'}! Your package is on the move.</p>
              </div>

              <!-- Content -->
              <div style="padding: 32px;">
                <!-- Order ID -->
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="background: #f3f4f6; padding: 8px 16px; border-radius: 20px; font-size: 14px; color: #6b7280;">
                    Order <strong style="color: #1a1a1a;">#${orderId.slice(0, 8).toUpperCase()}</strong>
                  </span>
                </div>

                ${trackingSection}
                ${deliverySection}

                <!-- Items -->
                <div style="margin-top: 24px;">
                  <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 16px;">Items Being Shipped</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${itemsList}
                  </table>
                </div>

                ${addressSection}

                <!-- Footer Message -->
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Questions about your order? Just reply to this email and we'll help you out.
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} iTag. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
  
  if (status === 'delivered') {
    return {
      subject: `✅ Your order #${orderId.slice(0, 8).toUpperCase()} has been delivered!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%); color: white; padding: 12px 24px; border-radius: 50px; font-weight: 700; font-size: 20px; letter-spacing: -0.5px;">
                iTag
              </div>
            </div>

            <!-- Main Card -->
            <div style="background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
              <!-- Hero Section -->
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">📬</div>
                <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Package Delivered!</h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Hey ${customerName || 'there'}, your order has arrived!</p>
              </div>

              <!-- Content -->
              <div style="padding: 32px;">
                <!-- Order ID -->
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="background: #f3f4f6; padding: 8px 16px; border-radius: 20px; font-size: 14px; color: #6b7280;">
                    Order <strong style="color: #1a1a1a;">#${orderId.slice(0, 8).toUpperCase()}</strong>
                  </span>
                </div>

                <!-- Success Message -->
                <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">🎊</div>
                  <p style="color: #7c3aed; font-weight: 500; margin: 0;">
                    We hope you love your new iTag products!
                  </p>
                </div>

                <!-- Items -->
                <div style="margin-top: 24px;">
                  <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 16px;">What You Received</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${itemsList}
                  </table>
                </div>

                <!-- Help Section -->
                <div style="margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 12px; text-align: center;">
                  <p style="color: #374151; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">
                    Need help with your products?
                  </p>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Our support team is here to help! Just reply to this email.
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} iTag. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
  }
  
  return null;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customerEmail, 
      customerName, 
      orderId, 
      status, 
      items, 
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      shippingAddress
    }: OrderStatusEmailRequest = await req.json();

    console.log(`Processing email for order ${orderId}, status: ${status}, email: ${customerEmail}`);

    if (!customerEmail) {
      console.log('No customer email provided, skipping email send');
      return new Response(JSON.stringify({ message: 'No email to send to' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailContent = getEmailContent(
      status, 
      customerName, 
      orderId, 
      items, 
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      shippingAddress
    );
    
    if (!emailContent) {
      console.log(`Status ${status} does not require an email notification`);
      return new Response(JSON.stringify({ message: 'No email needed for this status' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailResponse = await resend.emails.send({
      from: "iTag <onboarding@resend.dev>",
      to: [customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-status-email function:", error?.message || error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to send notification' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);