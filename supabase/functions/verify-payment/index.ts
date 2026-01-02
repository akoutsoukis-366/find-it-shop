import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function formatCurrency(amount: number, currency: string): string {
  const formatted = (amount / 100).toFixed(2);
  const symbol = currency.toUpperCase() === 'EUR' ? '€' : '$';
  return `${symbol}${formatted}`;
}

function generateOrderConfirmationEmail(
  customerName: string,
  orderId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  subtotal: number,
  shipping: number,
  total: number,
  currency: string,
  shippingAddress: any
): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-family: Arial, sans-serif;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: Arial, sans-serif;">${formatCurrency(item.price, currency)}</td>
    </tr>
  `).join('');

  const addressHtml = shippingAddress ? `
    <p style="margin: 0; color: #4b5563; font-family: Arial, sans-serif;">
      ${shippingAddress.name || ''}<br>
      ${shippingAddress.line1 || ''}<br>
      ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
      ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}<br>
      ${shippingAddress.country || ''}
    </p>
  ` : '<p style="color: #6b7280; font-family: Arial, sans-serif;">No shipping address provided</p>';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
          <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 30px;">✓</span>
          </div>
          <h1 style="color: white; margin: 0 0 10px; font-size: 28px; font-family: Arial, sans-serif;">Order Confirmed!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px; font-family: Arial, sans-serif;">Thank you for your purchase, ${customerName}!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px; font-family: Arial, sans-serif;">Order Number</p>
            <p style="margin: 0; color: #111827; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif;">#${orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <h2 style="color: #111827; font-size: 18px; margin: 0 0 15px; font-family: Arial, sans-serif;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-size: 14px; color: #6b7280; font-family: Arial, sans-serif;">Item</th>
                <th style="padding: 12px; text-align: center; font-size: 14px; color: #6b7280; font-family: Arial, sans-serif;">Qty</th>
                <th style="padding: 12px; text-align: right; font-size: 14px; color: #6b7280; font-family: Arial, sans-serif;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-family: Arial, sans-serif;">Subtotal</span>
              <span style="color: #111827; font-family: Arial, sans-serif;">${formatCurrency(subtotal, currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-family: Arial, sans-serif;">Shipping</span>
              <span style="color: #111827; font-family: Arial, sans-serif;">${shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <span style="color: #111827; font-weight: bold; font-size: 18px; font-family: Arial, sans-serif;">Total</span>
              <span style="color: #10b981; font-weight: bold; font-size: 18px; font-family: Arial, sans-serif;">${formatCurrency(total, currency)}</span>
            </div>
          </div>
          
          <h2 style="color: #111827; font-size: 18px; margin: 0 0 15px; font-family: Arial, sans-serif;">Shipping Address</h2>
          <div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            ${addressHtml}
          </div>
          
          <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 5px; color: #059669; font-weight: bold; font-family: Arial, sans-serif;">What's Next?</p>
            <p style="margin: 0; color: #047857; font-size: 14px; font-family: Arial, sans-serif;">Your order will be shipped soon. We'll send you tracking information once it's on its way!</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 30px 20px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0; font-family: Arial, sans-serif;">Thank you for shopping with us!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userId } = await req.json();
    
    if (!sessionId) {
      throw new Error("No session ID provided");
    }

    console.log("[VERIFY-PAYMENT] Verifying session:", sessionId, "User:", userId);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .single();

    if (existingOrder) {
      console.log("[VERIFY-PAYMENT] Order already exists:", existingOrder.id);
      return new Response(JSON.stringify({ success: true, orderId: existingOrder.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    console.log("[VERIFY-PAYMENT] Session verified, payment status:", session.payment_status);

    // Get line items
    const lineItems = session.line_items?.data || [];
    const items = lineItems.map((item: Stripe.LineItem) => ({
      name: item.description,
      quantity: item.quantity,
      price: item.amount_total,
    }));

    // Extract shipping address - check both shipping_details and customer_details
    let shippingAddress = null;
    
    if (session.shipping_details?.address) {
      shippingAddress = {
        name: session.shipping_details.name,
        line1: session.shipping_details.address.line1,
        line2: session.shipping_details.address.line2,
        city: session.shipping_details.address.city,
        state: session.shipping_details.address.state,
        postal_code: session.shipping_details.address.postal_code,
        country: session.shipping_details.address.country,
      };
    } else if (session.customer_details?.address) {
      // Fallback to customer_details address
      shippingAddress = {
        name: session.customer_details.name,
        line1: session.customer_details.address.line1,
        line2: session.customer_details.address.line2,
        city: session.customer_details.address.city,
        state: session.customer_details.address.state,
        postal_code: session.customer_details.address.postal_code,
        country: session.customer_details.address.country,
      };
    }
    
    console.log("[VERIFY-PAYMENT] Shipping address:", JSON.stringify(shippingAddress));
    console.log("[VERIFY-PAYMENT] Session shipping_details:", JSON.stringify(session.shipping_details));
    console.log("[VERIFY-PAYMENT] Session customer_details:", JSON.stringify(session.customer_details));

    // Insert order into database
    const { data, error } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        shipping_address: shippingAddress,
        items: items,
        subtotal: session.amount_subtotal || 0,
        shipping: session.shipping_cost?.amount_total || 0,
        total: session.amount_total || 0,
        currency: session.currency || "usd",
        status: "completed",
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[VERIFY-PAYMENT] Error inserting order:", error);
      throw new Error(error.message);
    }

    console.log("[VERIFY-PAYMENT] Order created:", data.id);

    // Send order confirmation email
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'Valued Customer';
    
    if (customerEmail) {
      try {
        const emailHtml = generateOrderConfirmationEmail(
          customerName,
          data.id,
          items,
          session.amount_subtotal || 0,
          session.shipping_cost?.amount_total || 0,
          session.amount_total || 0,
          session.currency || 'usd',
          shippingAddress
        );

        const emailResponse = await resend.emails.send({
          from: "iTag Store <onboarding@resend.dev>",
          to: [customerEmail],
          subject: `Order Confirmed - #${data.id.slice(0, 8).toUpperCase()}`,
          html: emailHtml,
        });

        console.log("[VERIFY-PAYMENT] Confirmation email sent:", emailResponse);
      } catch (emailError) {
        // Log email error but don't fail the order
        console.error("[VERIFY-PAYMENT] Failed to send confirmation email:", emailError);
      }
    } else {
      console.log("[VERIFY-PAYMENT] No customer email available, skipping confirmation email");
    }

    return new Response(JSON.stringify({ success: true, orderId: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log full error details server-side for debugging
    console.error("[VERIFY-PAYMENT] Error:", error instanceof Error ? error.message : String(error));
    
    // Return generic error message to client
    return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
