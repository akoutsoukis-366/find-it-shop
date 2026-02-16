import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Product {
  id: string;
  name: string;
  price: number;
}

// Input validation functions
function validateCartItem(
  item: unknown, 
  index: number, 
  validProductIds: Set<string>
): { productId: string; quantity: number; selectedColor: string } {
  if (!item || typeof item !== 'object') {
    throw new Error(`Invalid cart item at index ${index}`);
  }
  
  const cartItem = item as Record<string, unknown>;
  
  if (typeof cartItem.productId !== 'string' || !validProductIds.has(cartItem.productId)) {
    throw new Error(`Invalid product ID at index ${index}`);
  }
  
  const quantity = Number(cartItem.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new Error(`Invalid quantity at index ${index}: must be between 1 and 100`);
  }
  
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
  
  const email = typeof customerInfo.email === 'string' 
    ? customerInfo.email.slice(0, 255).trim() 
    : undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format');
  }
  
  const name = typeof customerInfo.name === 'string' 
    ? customerInfo.name.slice(0, 200).trim() 
    : undefined;
  
  const phone = typeof customerInfo.phone === 'string' 
    ? customerInfo.phone.slice(0, 30).trim() 
    : undefined;
  
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

// Domestic-only countries (when international shipping is disabled)
const DOMESTIC_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = ["GR"];

// All supported countries
const ALL_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
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
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    console.log("[CREATE-CHECKOUT] Starting checkout session creation");

    if (!body.items || !Array.isArray(body.items)) {
      throw new Error("Items must be an array");
    }
    
    if (body.items.length === 0) {
      throw new Error("No items provided for checkout");
    }
    
    if (body.items.length > 50) {
      throw new Error("Too many items in cart (max 50)");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, price');

    if (productsError) {
      console.error("[CREATE-CHECKOUT] Error fetching products:", productsError);
      throw new Error("Failed to fetch product data");
    }

    const products = productsData as Product[];
    const productMap = new Map<string, Product>();
    const validProductIds = new Set<string>();
    
    products.forEach(product => {
      productMap.set(product.id, product);
      validProductIds.add(product.id);
    });

    console.log("[CREATE-CHECKOUT] Loaded", products.length, "products from database");

    const items = body.items.map((item: unknown, index: number) => 
      validateCartItem(item, index, validProductIds)
    );
    
    const customerInfo = validateCustomerInfo(body.customerInfo);
    
    let customerEmail: string | undefined;
    if (typeof body.customerEmail === 'string') {
      customerEmail = body.customerEmail.slice(0, 255).trim();
      if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        throw new Error('Invalid customer email format');
      }
    }
    
    console.log("[CREATE-CHECKOUT] Validated items count:", items.length);

    // Fetch settings from database including international_shipping
    const { data: settingsData } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['currency', 'shipping_cost', 'free_shipping_threshold', 'international_shipping']);

    const settingsMap: Record<string, string> = {};
    settingsData?.forEach((item: { key: string; value: string | null }) => {
      settingsMap[item.key] = item.value || '';
    });

    const currency = (settingsMap.currency || 'USD').toLowerCase();
    const shippingCost = parseFloat(settingsMap.shipping_cost || '0');
    const freeShippingThreshold = parseFloat(settingsMap.free_shipping_threshold || '0');
    const internationalShipping = settingsMap.international_shipping !== 'false'; // default true
    
    console.log("[CREATE-CHECKOUT] Settings - Currency:", currency, "Shipping:", shippingCost, "Free threshold:", freeShippingThreshold, "International:", internationalShipping);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const subtotalInCents = items.reduce((sum: number, item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      const priceInCents = Math.round((product?.price || 0) * 100);
      return sum + priceInCents * item.quantity;
    }, 0);
    const subtotalInDollars = subtotalInCents / 100;

    const lineItems = items.map((item: { productId: string; quantity: number; selectedColor: string }) => {
      const product = productMap.get(item.productId);
      const priceInCents = Math.round((product?.price || 0) * 100);
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: product?.name || "Unknown Product",
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    });

    const qualifiesForFreeShipping = freeShippingThreshold > 0 && subtotalInDollars >= freeShippingThreshold;
    
    if (shippingCost > 0 && !qualifiesForFreeShipping) {
      const shippingInCents = Math.round(shippingCost * 100);
      lineItems.push({
        price_data: {
          currency: currency,
          product_data: {
            name: 'Shipping',
          },
          unit_amount: shippingInCents,
        },
        quantity: 1,
      });
      console.log("[CREATE-CHECKOUT] Added shipping:", shippingInCents, "cents");
    } else if (qualifiesForFreeShipping) {
      console.log("[CREATE-CHECKOUT] Free shipping applied (subtotal:", subtotalInDollars, ">= threshold:", freeShippingThreshold, ")");
    }

    console.log("[CREATE-CHECKOUT] Line items:", JSON.stringify(lineItems));

    let customerId: string | undefined;
    const email = customerInfo?.email || customerEmail;
    
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-CHECKOUT] Found existing customer:", customerId);
      } else if (customerInfo) {
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

    // Use domestic or all countries based on international_shipping setting
    const allowedCountries = internationalShipping ? ALL_COUNTRIES : DOMESTIC_COUNTRIES;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      shipping_address_collection: {
        allowed_countries: allowedCountries,
      },
      phone_number_collection: {
        enabled: true,
      },
    };

    if (customerId) {
      sessionConfig.customer = customerId;
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
    console.error("[CREATE-CHECKOUT] Error:", error instanceof Error ? error.message : String(error));
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isValidationError = errorMessage.includes('Invalid') || 
                              errorMessage.includes('must be') || 
                              errorMessage.includes('required') ||
                              errorMessage.includes('Too many');
    
    const clientMessage = isValidationError ? errorMessage : 'Unable to create checkout session';
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
