import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { corsHeaders } from "../cors.ts";

Deno.serve(async (req) => {
  try {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const { id, isComplete } = await req.json();

    console.log({ id, isComplete });

    if (typeof id !== "number" || typeof isComplete !== "boolean") {
      return new Response("Invalid request body", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );
    // Update the todo item
    const { data, error } = await supabase
      .from("todos")
      .update({ isComplete })
      .eq("id", id)
      .select(); // Ensure to select the updated data

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ data }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
