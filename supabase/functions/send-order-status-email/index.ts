import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  status: string;
  items: Array<{ name: string; quantity: number }>;
  trackingNumber?: string;
}

const getEmailContent = (
  status: string, 
  customerName: string, 
  orderId: string, 
  items: Array<{ name: string; quantity: number }>,
  trackingNumber?: string
) => {
  const itemsList = items.map(item => `<li>${item.name} (×${item.quantity})</li>`).join('');
  const trackingSection = trackingNumber 
    ? `<div style="background: #e8f4fd; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
         <p style="margin: 0; font-weight: 600; color: #1a1a1a;">📍 Tracking Number</p>
         <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 16px; color: #2563eb;">${trackingNumber}</p>
       </div>`
    : '';
  
  if (status === 'shipped') {
    return {
      subject: `Your order #${orderId.slice(0, 8)} has been shipped!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Your Order Has Been Shipped! 📦</h1>
          <p style="color: #4a4a4a; font-size: 16px;">Hi ${customerName || 'there'},</p>
          <p style="color: #4a4a4a; font-size: 16px;">Great news! Your order is on its way.</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Order #${orderId.slice(0, 8)}</p>
            <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">${itemsList}</ul>
          </div>
          ${trackingSection}
          <p style="color: #4a4a4a; font-size: 16px;">You should receive your package soon. Thank you for shopping with us!</p>
          <p style="color: #888; font-size: 14px; margin-top: 30px;">— The iTag Team</p>
        </div>
      `,
    };
  }
  
  if (status === 'delivered') {
    return {
      subject: `Your order #${orderId.slice(0, 8)} has been delivered!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Your Order Has Been Delivered! 🎉</h1>
          <p style="color: #4a4a4a; font-size: 16px;">Hi ${customerName || 'there'},</p>
          <p style="color: #4a4a4a; font-size: 16px;">Your order has been successfully delivered!</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Order #${orderId.slice(0, 8)}</p>
            <ul style="margin: 0; padding-left: 20px; color: #4a4a4a;">${itemsList}</ul>
          </div>
          <p style="color: #4a4a4a; font-size: 16px;">We hope you love your new iTag products. If you have any questions, feel free to reach out!</p>
          <p style="color: #888; font-size: 14px; margin-top: 30px;">— The iTag Team</p>
        </div>
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
    const { customerEmail, customerName, orderId, status, items, trackingNumber }: OrderStatusEmailRequest = await req.json();

    console.log(`Processing email for order ${orderId}, status: ${status}, email: ${customerEmail}`);

    if (!customerEmail) {
      console.log('No customer email provided, skipping email send');
      return new Response(JSON.stringify({ message: 'No email to send to' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailContent = getEmailContent(status, customerName, orderId, items, trackingNumber);
    
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
    console.error("Error in send-order-status-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
