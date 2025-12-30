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
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      shipping_address_collection: {
        allowed_countries: [
          "AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AT", "AU", "AW", "AX", "AZ",
          "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ",
          "CA", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CV", "CW", "CY", "CZ",
          "DE", "DJ", "DK", "DM", "DO", "DZ",
          "EC", "EE", "EG", "EH", "ER", "ES", "ET",
          "FI", "FJ", "FK", "FO", "FR",
          "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY",
          "HK", "HN", "HR", "HT", "HU",
          "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IS", "IT",
          "JE", "JM", "JO", "JP",
          "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KY", "KZ",
          "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY",
          "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MO", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
          "NA", "NC", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ",
          "OM",
          "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PY",
          "QA",
          "RE", "RO", "RS", "RU", "RW",
          "SA", "SB", "SC", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SZ",
          "TA", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ",
          "UA", "UG", "US", "UY", "UZ",
          "VA", "VC", "VE", "VG", "VN", "VU",
          "WF", "WS",
          "XK",
          "YE", "YT",
          "ZA", "ZM", "ZW"
        ],
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
