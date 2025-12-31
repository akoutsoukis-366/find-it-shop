import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    console.log(`[SEND-CONTACT-EMAIL] New contact from: ${name} <${email}>`);

    if (!name || !email || !message) {
      console.log('[SEND-CONTACT-EMAIL] Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch admin email from settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settingsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'contact_email')
      .maybeSingle();

    const adminEmail = settingsData?.value || "aris.koutsouki@gmail.com";
    console.log(`[SEND-CONTACT-EMAIL] Sending notification to: ${adminEmail}`);

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "iTag <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">New Contact Form Submission</h1>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 12px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 12px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #888; font-size: 14px; margin-top: 30px;">— iTag Contact Form</p>
        </div>
      `,
    });

    console.log("[SEND-CONTACT-EMAIL] Admin notification sent:", adminEmailResponse);

    // Send confirmation to the user
    const userEmailResponse = await resend.emails.send({
      from: "iTag <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Thank You for Contacting Us!</h1>
          
          <p style="color: #4a4a4a; font-size: 16px;">Hi ${name},</p>
          
          <p style="color: #4a4a4a; font-size: 16px;">
            We've received your message and will get back to you as soon as possible, 
            typically within 24-48 hours.
          </p>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Your message:</p>
            <p style="margin: 0; color: #666; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #4a4a4a; font-size: 16px;">
            In the meantime, feel free to browse our <a href="https://itag.com/products" style="color: #2563eb;">products</a> 
            or check out our <a href="https://itag.com/about" style="color: #2563eb;">FAQ</a>.
          </p>
          
          <p style="color: #888; font-size: 14px; margin-top: 30px;">— The iTag Team</p>
        </div>
      `,
    });

    console.log("[SEND-CONTACT-EMAIL] User confirmation sent:", userEmailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[SEND-CONTACT-EMAIL] Error:", error?.message || error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);