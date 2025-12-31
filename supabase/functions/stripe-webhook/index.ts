import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  
  // Security: Require webhook secret to be configured
  if (!webhookSecret) {
    console.error("[STRIPE-WEBHOOK] STRIPE_WEBHOOK_SECRET not configured");
    return new Response(
      JSON.stringify({ error: "Webhook not configured" }), 
      { status: 500 }
    );
  }
  
  // Security: Require signature header
  if (!signature) {
    console.error("[STRIPE-WEBHOOK] Missing stripe-signature header");
    return new Response(
      JSON.stringify({ error: "Missing signature" }), 
      { status: 401 }
    );
  }
  
  let event: Stripe.Event;
  
  try {
    const body = await req.text();
    
    // Verify webhook signature - required for security
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (signatureError) {
      const errorMessage = signatureError instanceof Error ? signatureError.message : String(signatureError);
      console.error("[STRIPE-WEBHOOK] Signature verification failed:", errorMessage);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }), 
        { status: 401 }
      );
    }
    
    console.log(`[STRIPE-WEBHOOK] Event received: ${event.type}`);
    
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`[STRIPE-WEBHOOK] Processing completed session: ${session.id}`);
      
      // Get line items for the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      const items = lineItems.data.map((item: Stripe.LineItem) => ({
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
      
      console.log(`[STRIPE-WEBHOOK] Shipping address:`, JSON.stringify(shippingAddress));
      
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
        })
        .select()
        .single();
      
      if (error) {
        console.error(`[STRIPE-WEBHOOK] Error inserting order:`, error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }
      
      console.log(`[STRIPE-WEBHOOK] Order created:`, data.id);
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[STRIPE-WEBHOOK] Error:`, errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
});