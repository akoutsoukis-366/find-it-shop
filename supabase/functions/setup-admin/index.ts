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
    const { email, password, setupKey } = await req.json();

    // Validate setup key from environment secret
    const validSetupKey = Deno.env.get("ADMIN_SETUP_KEY");
    if (!validSetupKey) {
      console.error("[SETUP-ADMIN] ADMIN_SETUP_KEY environment variable is not configured");
      throw new Error("Setup is not properly configured");
    }
    
    if (!setupKey || setupKey !== validSetupKey) {
      throw new Error("Invalid setup key");
    }

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("[SETUP-ADMIN] Creating admin user:", email);

    // Create user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      // If user exists, try to get their ID
      if (createError.message.includes("already been registered")) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (existingUser) {
          // Add admin role to existing user
          const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({ user_id: existingUser.id, role: "admin" }, { onConflict: "user_id,role" });

          if (roleError) throw roleError;

          console.log("[SETUP-ADMIN] Added admin role to existing user:", existingUser.id);
          return new Response(JSON.stringify({ 
            success: true, 
            message: "Admin role added to existing user",
            userId: existingUser.id 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      throw createError;
    }

    // Add admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userData.user.id, role: "admin" });

    if (roleError) throw roleError;

    console.log("[SETUP-ADMIN] Admin user created:", userData.user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin user created successfully",
      userId: userData.user.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    // Log full error details server-side for debugging
    const internalError = error instanceof Error ? error.message : String(error);
    console.error("[SETUP-ADMIN] Error:", internalError);
    
    // Only expose validation errors, not internal errors
    const safeErrors = [
      'Invalid setup key',
      'Email and password are required',
      'Password must be at least 6 characters',
      'Setup is not properly configured'
    ];
    const clientMessage = safeErrors.includes(internalError) ? internalError : 'Setup failed';
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
