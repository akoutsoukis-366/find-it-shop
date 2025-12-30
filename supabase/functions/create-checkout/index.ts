import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map product IDs to Stripe price IDs
const priceMapping: Record<string, string> = {
  "1": "price_1SkAGv2IvxMhfbuvLA70JaiF", // iTag Pro
  "2": "price_1SkAH12IvxMhfbuvcCBgMg9Q", // iTag Mini
  "3": "price_1SkAH32IvxMhfbuvIkcfVybn", // iTag Ultra
  "4": "price_1SkAH42IvxMhfbuvLOoxUqX0", // iTag Slim
  "5": "price_1SkAH62IvxMhfbuvWkXe2cm3", // iTag Pet
  "6": "price_1SkAH82IvxMhfbuvq03DEvK3", // iTag 4-Pack
};

interface CartItem {
  productId: string;
  quantity: number;
  selectedColor: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerEmail } = await req.json();
    
    console.log("[CREATE-CHECKOUT] Starting checkout session creation");
    console.log("[CREATE-CHECKOUT] Items received:", JSON.stringify(items));

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided for checkout");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Build line items from cart
    const lineItems = items.map((item: CartItem) => {
      const priceId = priceMapping[item.productId];
      if (!priceId) {
        throw new Error(`Unknown product ID: ${item.productId}`);
      }
      return {
        price: priceId,
        quantity: item.quantity,
      };
    });

    console.log("[CREATE-CHECKOUT] Line items:", JSON.stringify(lineItems));

    // Create checkout session (guest checkout supported)
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR"],
      },
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log("[CREATE-CHECKOUT] Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
