import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map product IDs (UUIDs from database) to Stripe price IDs
const priceMapping: Record<string, string> = {
  "c3b9b190-2c40-4585-9df4-3951a73da274": "price_1SkAGv2IvxMhfbuvLA70JaiF", // iTag Pro
  "9b88372b-d53e-47e6-8a4f-c00c7551873c": "price_1SkAH12IvxMhfbuvcCBgMg9Q", // iTag Mini
  "582fa096-7c4e-4cc4-b816-f813c517b206": "price_1SkAH32IvxMhfbuvIkcfVybn", // iTag Ultra
  "9241cf38-6d1b-4d86-b48b-8bb2f6ae6bfd": "price_1SkAH42IvxMhfbuvLOoxUqX0", // iTag Slim
  "721c44b0-1b4a-4856-9581-9c569232105f": "price_1SkAH62IvxMhfbuvWkXe2cm3", // iTag Pet
  "b894ac5b-f1ae-4c79-9622-a7d792fc758c": "price_1SkAH82IvxMhfbuvq03DEvK3", // iTag 4-Pack
};

interface CartItem {
  productId: string;
  quantity: number;
  selectedColor: string;
}

interface CustomerInfo {
  email?: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerEmail, customerInfo } = await req.json();
    
    console.log("[CREATE-CHECKOUT] Starting checkout session creation");
    console.log("[CREATE-CHECKOUT] Items received:", JSON.stringify(items));
    console.log("[CREATE-CHECKOUT] Customer info:", JSON.stringify(customerInfo));

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

    // Check for existing Stripe customer or create new one with prefilled info
    let customerId: string | undefined;
    const email = customerInfo?.email || customerEmail;
    
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-CHECKOUT] Found existing customer:", customerId);
      } else if (customerInfo) {
        // Create new customer with prefilled info
        const newCustomer = await stripe.customers.create({
          email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address ? {
            line1: customerInfo.address.line1 || '',
            line2: customerInfo.address.line2 || '',
            city: customerInfo.address.city || '',
            state: customerInfo.address.state || '',
            postal_code: customerInfo.address.postal_code || '',
            country: customerInfo.address.country || 'US',
          } : undefined,
        });
        customerId = newCustomer.id;
        console.log("[CREATE-CHECKOUT] Created new customer:", customerId);
      }
    }

    // Create checkout session with prefilled customer data
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
      phone_number_collection: {
        enabled: true,
      },
    };

    // Add customer with full prefill or just email
    if (customerId) {
      sessionConfig.customer = customerId;
      // Update customer with latest info if available
      if (customerInfo) {
        try {
          await stripe.customers.update(customerId, {
            name: customerInfo.name || undefined,
            phone: customerInfo.phone || undefined,
            address: customerInfo.address?.line1 ? {
              line1: customerInfo.address.line1,
              line2: customerInfo.address.line2 || undefined,
              city: customerInfo.address.city || undefined,
              state: customerInfo.address.state || undefined,
              postal_code: customerInfo.address.postal_code || undefined,
              country: customerInfo.address.country || 'US',
            } : undefined,
          });
          console.log("[CREATE-CHECKOUT] Updated customer with latest profile data");
        } catch (updateError) {
          console.log("[CREATE-CHECKOUT] Could not update customer:", updateError);
        }
      }
    } else if (email) {
      sessionConfig.customer_email = email;
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
