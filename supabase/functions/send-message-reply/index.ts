import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { messageId, replyBody, subject } = await req.json();

    if (!messageId || !replyBody || typeof replyBody !== "string" || replyBody.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (replyBody.length > 10000) {
      return new Response(JSON.stringify({ error: "Reply too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: message, error: msgErr } = await admin
      .from("contact_messages")
      .select("id, name, email, message")
      .eq("id", messageId)
      .maybeSingle();

    if (msgErr || !message) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: settingsData } = await admin
      .from("settings")
      .select("key, value")
      .in("key", ["store_name", "contact_email"]);
    const settings: Record<string, string> = {};
    settingsData?.forEach((r: { key: string; value: string | null }) => {
      settings[r.key] = r.value || "";
    });
    const storeName = settings.store_name || "Metavex";
    const replyTo = settings.contact_email || "support@metavex.gr";

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const finalSubject =
      typeof subject === "string" && subject.trim().length > 0
        ? subject.trim().slice(0, 200)
        : `Απάντηση από ${storeName}`;

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
        <p style="font-size:16px;">Γεια σας ${escape(message.name)},</p>
        <div style="font-size:16px;line-height:1.6;white-space:pre-wrap;margin:16px 0;">${escape(replyBody)}</div>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
        <p style="color:#888;font-size:13px;margin:0 0 6px 0;">Σε απάντηση του μηνύματός σας:</p>
        <blockquote style="margin:0;padding:10px 14px;border-left:3px solid #ddd;color:#666;font-size:14px;white-space:pre-wrap;">${escape(message.message)}</blockquote>
        <p style="color:#888;font-size:13px;margin-top:24px;">— Η ομάδα ${escape(storeName)}</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: `${storeName} <support@metavex.gr>`,
      to: [message.email],
      reply_to: replyTo,
      subject: finalSubject,
      html,
    });

    const resendError = (result as any)?.error;
    const resendId = (result as any)?.data?.id || (result as any)?.id || null;

    const { data: insertedReply } = await admin
      .from("message_replies")
      .insert({
        message_id: messageId,
        subject: finalSubject,
        body: replyBody,
        recipient_email: message.email,
        status: resendError ? "failed" : "sent",
        resend_id: resendId,
        error: resendError ? String(resendError?.message || resendError) : null,
        sent_by: userData.user.id,
      })
      .select("id")
      .maybeSingle();

    if (insertedReply?.id) {
      await admin.from("message_reply_events").insert({
        reply_id: insertedReply.id,
        event_type: resendError ? "email.failed" : "email.sent",
        status: resendError ? "failed" : "sent",
        raw: resendError
          ? { error: String(resendError?.message || resendError) }
          : { resend_id: resendId, recipient: message.email, subject: finalSubject },
      });
    }

    if (resendError) {
      console.error("[SEND-MESSAGE-REPLY] Resend error:", resendError);
      return new Response(JSON.stringify({ error: "Send failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    await admin.from("contact_messages").update({ read: true }).eq("id", messageId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[SEND-MESSAGE-REPLY] Error:", error?.message || error);
    return new Response(JSON.stringify({ error: "Failed to send reply" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});