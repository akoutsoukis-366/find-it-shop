import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Product prices in cents (for dynamic tax calculation)
const productPrices: Record<string, number> = {
  "c3b9b190-2c40-4585-9df4-3951a73da274": 3999, // iTag Pro
  "9b88372b-d53e-47e6-8a4f-c00c7551873c": 2499, // iTag Mini
  "582fa096-7c4e-4cc4-b816-f813c517b206": 5999, // iTag Ultra
  "9241cf38-6d1b-4d86-b48b-8bb2f6ae6bfd": 3499, // iTag Slim
  "721c44b0-1b4a-4856-9581-9c569232105f": 2999, // iTag Pet
  "b894ac5b-f1ae-4c79-9622-a7d792fc758c": 8999, // iTag 4-Pack
};

// Product names for dynamic pricing
const productNames: Record<string, string> = {
  "c3b9b190-2c40-4585-9df4-3951a73da274": "iTag Pro",
  "9b88372b-d53e-47e6-8a4f-c00c7551873c": "iTag Mini",
  "582fa096-7c4e-4cc4-b816-f813c517b206": "iTag Ultra",
  "9241cf38-6d1b-4d86-b48b-8bb2f6ae6bfd": "iTag Slim",
  "721c44b0-1b4a-4856-9581-9c569232105f": "iTag Pet",
  "b894ac5b-f1ae-4c79-9622-a7d792fc758c": "iTag 4-Pack",
};

function getProductName(productId: string): string {
  return productNames[productId] || "Unknown Product";
}
const validProductIds = new Set(Object.keys(priceMapping));

// Input validation functions
function validateCartItem(item: unknown, index: number): { productId: string; quantity: number; selectedColor: string } {
  if (!item || typeof item !== 'object') {
    throw new Error(`Invalid cart item at index ${index}`);
  }
  
  const cartItem = item as Record<string, unknown>;
  
  // Validate productId
  if (typeof cartItem.productId !== 'string' || !validProductIds.has(cartItem.productId)) {
    throw new Error(`Invalid product ID at index ${index}`);
  }
  
  // Validate quantity - must be positive integer between 1 and 100
  const quantity = Number(cartItem.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new Error(`Invalid quantity at index ${index}: must be between 1 and 100`);
  }
  
  // Validate selectedColor - string with max length
  const selectedColor = typeof cartItem.selectedColor === 'string' 
    ? cartItem.selectedColor.slice(0, 50) 
    : '';
  
  return {
    productId: cartItem.productId,
    quantity,
    selectedColor,
  };
}

function validateCustomerInfo(info: unknown): {
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
} | undefined {
  if (!info || typeof info !== 'object') {
    return undefined;
  }
  
  const customerInfo = info as Record<string, unknown>;
  
  // Validate email format if provided
  const email = typeof customerInfo.email === 'string' 
    ? customerInfo.email.slice(0, 255).trim() 
    : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }
  
  // Validate name with length limit
  const name = typeof customerInfo.name === 'string' 
    ? customerInfo.name.slice(0, 200).trim() 
    : undefined;
  
  // Validate phone with length limit
  const phone = typeof customerInfo.phone === 'string' 
    ? customerInfo.phone.slice(0, 30).trim() 
    : undefined;
  
  // Validate address
  let address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | undefined;
  
  if (customerInfo.address && typeof customerInfo.address === 'object') {
    const addr = customerInfo.address as Record<string, unknown>;
    address = {
      line1: typeof addr.line1 === 'string' ? addr.line1.slice(0, 200).trim() : undefined,
      line2: typeof addr.line2 === 'string' ? addr.line2.slice(0, 200).trim() : undefined,
      city: typeof addr.city === 'string' ? addr.city.slice(0, 100).trim() : undefined,
      state: typeof addr.state === 'string' ? addr.state.slice(0, 50).trim() : undefined,
      postal_code: typeof addr.postal_code === 'string' ? addr.postal_code.slice(0, 20).trim() : undefined,
      country: typeof addr.country === 'string' ? addr.country.slice(0, 2).toUpperCase() : undefined,
    };
  }
  
  return { email, name, phone, address };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    console.log("[CREATE-CHECKOUT] Starting checkout session creation");

    // Validate items array
    if (!body.items || !Array.isArray(body.items)) {
      throw new Error("Items must be an array");
    }
    
    if (body.items.length === 0) {
      throw new Error("No items provided for checkout");
    }
    
    if (body.items.length > 50) {
      throw new Error("Too many items in cart (max 50)");
    }

    // Validate each cart item
    const items = body.items.map((item: unknown, index: number) => validateCartItem(item, index));
    
    // Validate customer info
    const customerInfo = validateCustomerInfo(body.customerInfo);
    
    // Validate customerEmail if provided separately
    let customerEmail: string | undefined;
    if (typeof body.customerEmail === 'string') {
      customerEmail = body.customerEmail.slice(0, 255).trim();
      if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        throw new Error('Invalid customer email format');
      }
    }
    
    console.log("[CREATE-CHECKOUT] Validated items count:", items.length);

    // Fetch settings from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settingsData } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['currency', 'tax_rate']);

    const settingsMap: Record<string, string> = {};
    settingsData?.forEach((item: { key: string; value: string | null }) => {
      settingsMap[item.key] = item.value || '';
    });

    const currency = (settingsMap.currency || 'USD').toLowerCase();
    const taxRate = parseFloat(settingsMap.tax_rate || '0');
    
    console.log("[CREATE-CHECKOUT] Using currency:", currency, "Tax rate:", taxRate);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Build line items from cart using price_data for dynamic currency
    const lineItems = items.map((item: { productId: string; quantity: number; selectedColor: string }) => {
      const priceInCents = productPrices[item.productId] || 0;
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: getProductName(item.productId),
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    });

    // Add tax as a separate line item if tax rate > 0
    if (taxRate > 0) {
      const subtotal = items.reduce((sum: number, item: { productId: string; quantity: number }) => {
        return sum + (productPrices[item.productId] || 0) * item.quantity;
      }, 0);
      const taxAmount = Math.round(subtotal * (taxRate / 100));
      
      lineItems.push({
        price_data: {
          currency: currency,
          product_data: {
            name: `Tax (${taxRate}%)`,
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }

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
        // Create new customer with prefilled info including shipping
        const addressData = customerInfo.address ? {
          line1: customerInfo.address.line1 || '',
          line2: customerInfo.address.line2 || '',
          city: customerInfo.address.city || '',
          state: customerInfo.address.state || '',
          postal_code: customerInfo.address.postal_code || '',
          country: customerInfo.address.country || 'US',
        } : undefined;
        
        const newCustomer = await stripe.customers.create({
          email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: addressData,
          shipping: addressData ? {
            name: customerInfo.name || '',
            phone: customerInfo.phone || '',
            address: addressData,
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
      // Update customer with latest info including shipping for prefill
      if (customerInfo) {
        try {
          const addressData = customerInfo.address?.line1 ? {
            line1: customerInfo.address.line1,
            line2: customerInfo.address.line2 || undefined,
            city: customerInfo.address.city || undefined,
            state: customerInfo.address.state || undefined,
            postal_code: customerInfo.address.postal_code || undefined,
            country: customerInfo.address.country || 'US',
          } : undefined;
          
          await stripe.customers.update(customerId, {
            name: customerInfo.name || undefined,
            phone: customerInfo.phone || undefined,
            address: addressData,
            shipping: addressData ? {
              name: customerInfo.name || '',
              phone: customerInfo.phone || '',
              address: addressData,
            } : undefined,
          });
          console.log("[CREATE-CHECKOUT] Updated customer with latest profile and shipping data");
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
    // Log full error details server-side for debugging
    console.error("[CREATE-CHECKOUT] Error:", error instanceof Error ? error.message : String(error));
    
    // Return sanitized error message to client
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isValidationError = errorMessage.includes('Invalid') || 
                              errorMessage.includes('must be') || 
                              errorMessage.includes('required') ||
                              errorMessage.includes('Too many');
    
    // Only expose validation errors, not internal errors
    const clientMessage = isValidationError ? errorMessage : 'Unable to create checkout session';
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});