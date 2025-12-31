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
    // Use service role for all operations to bypass RLS
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
      console.error("[GET-USERS-AUTH-STATUS] Admin check failed for user:", user.id, roleError?.message);
      throw new Error("Admin access required");
    }

    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds)) {
      throw new Error("userIds array required");
    }

    console.log("[GET-USERS-AUTH-STATUS] Fetching auth status for", userIds.length, "users");

    // Fetch all users and filter by the requested IDs
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      throw usersError;
    }

    // Filter to only requested users and extract relevant fields
    const users = authUsers.users
      .filter(u => userIds.includes(u.id))
      .map(u => ({
        id: u.id,
        email_confirmed_at: u.email_confirmed_at,
      }));

    console.log("[GET-USERS-AUTH-STATUS] Found", users.length, "matching users");

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log full error details server-side for debugging
    const internalError = error instanceof Error ? error.message : String(error);
    console.error("[GET-USERS-AUTH-STATUS] Error:", internalError);
    
    // Return generic error message to client
    const safeErrors = ['No authorization header', 'Unauthorized', 'Admin access required', 'userIds array required'];
    const clientMessage = safeErrors.includes(internalError) ? internalError : 'Failed to fetch user status';
    
    return new Response(JSON.stringify({ error: clientMessage, users: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with empty users to allow fallback
    });
  }
});
