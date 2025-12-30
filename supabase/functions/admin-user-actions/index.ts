import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

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
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const parts = authHeader.trim().split(/\s+/);
    const token = parts.length === 2 ? parts[1] : authHeader.replace(/^Bearer\s+/i, "");

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[ADMIN-USER-ACTIONS] getUser failed:", authError?.message);
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
        
        // First, manually delete related data that might not have cascade
        // Delete user roles
        const { error: rolesDeleteError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        
        if (rolesDeleteError) {
          console.error("[ADMIN-USER-ACTIONS] Error deleting user roles:", rolesDeleteError);
        }

        // Delete profile
        const { error: profileDeleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('user_id', userId);
        
        if (profileDeleteError) {
          console.error("[ADMIN-USER-ACTIONS] Error deleting profile:", profileDeleteError);
        }

        // Update orders to remove user_id (keep orders for records)
        const { error: ordersUpdateError } = await supabaseAdmin
          .from('orders')
          .update({ user_id: null })
          .eq('user_id', userId);
        
        if (ordersUpdateError) {
          console.error("[ADMIN-USER-ACTIONS] Error updating orders:", ordersUpdateError);
        }
        
        // Now delete from auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error("[ADMIN-USER-ACTIONS] Error deleting auth user:", deleteError);
          throw new Error(`Failed to delete user: ${deleteError.message}`);
        }
        
        console.log("[ADMIN-USER-ACTIONS] User deleted successfully:", userId);
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

    const status = errorMessage === "Unauthorized" ? 401 : 400;

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
