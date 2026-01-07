import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[DELETE-ACCOUNT] Starting account deletion");

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    console.log("[DELETE-ACCOUNT] Deleting user:", userId);

    // Nullify user_id in orders to preserve order history for analytics
    const { error: ordersError } = await supabaseAdmin
      .from('orders')
      .update({ user_id: null })
      .eq('user_id', userId);

    if (ordersError) {
      console.error("[DELETE-ACCOUNT] Error updating orders:", ordersError);
    }

    // Delete user's profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error("[DELETE-ACCOUNT] Error deleting profile:", profileError);
    }

    // Delete user's roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesError) {
      console.error("[DELETE-ACCOUNT] Error deleting roles:", rolesError);
    }

    // Delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("[DELETE-ACCOUNT] Error deleting user:", deleteError);
      throw new Error("Failed to delete account");
    }

    console.log("[DELETE-ACCOUNT] Account deleted successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log full error details server-side for debugging
    const internalError = error instanceof Error ? error.message : String(error);
    console.error("[DELETE-ACCOUNT] Error:", internalError);
    
    // Return sanitized error message to client
    const isAuthError = internalError === 'No authorization header provided' || 
                        internalError === 'User not authenticated';
    const clientMessage = isAuthError ? internalError : 'Failed to delete account';
    const status = isAuthError ? 401 : 500;
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
