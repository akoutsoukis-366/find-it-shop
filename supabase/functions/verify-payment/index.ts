import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
