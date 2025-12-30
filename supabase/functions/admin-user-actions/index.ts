import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin using service role to bypass RLS
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error("[ADMIN-USER-ACTIONS] Admin check failed:", roleError?.message);
      throw new Error("Admin access required");
    }

    const { action, userId, email } = await req.json();
    console.log("[ADMIN-USER-ACTIONS] Action:", action, "for user:", userId || email);

    switch (action) {
      case 'resend_verification': {
        if (!email) throw new Error("Email required");
        
        // Generate a new signup link which will resend verification
        const { error } = await supabaseAdmin.auth.resend({
          type: 'signup',
          email: email,
        });
        
        if (error) {
          // If resend fails, try generating magic link as fallback
          console.log("[ADMIN-USER-ACTIONS] Resend failed, trying invite:", error.message);
          const { error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
          });
          if (inviteError) throw inviteError;
        }
        
        console.log("[ADMIN-USER-ACTIONS] Verification email resent to:", email);
        return new Response(JSON.stringify({ success: true, message: "Verification email sent" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'delete_user': {
        if (!userId) throw new Error("User ID required");
        
        // Delete from auth (this will cascade to profiles due to FK)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (deleteError) throw deleteError;
        
        console.log("[ADMIN-USER-ACTIONS] User deleted:", userId);
        return new Response(JSON.stringify({ success: true, message: "User deleted" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'ban_user': {
        if (!userId) throw new Error("User ID required");
        
        // Update user metadata to mark as banned
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: '876000h', // ~100 years
        });
        
        if (banError) throw banError;
        
        console.log("[ADMIN-USER-ACTIONS] User banned:", userId);
        return new Response(JSON.stringify({ success: true, message: "User banned" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ADMIN-USER-ACTIONS] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
