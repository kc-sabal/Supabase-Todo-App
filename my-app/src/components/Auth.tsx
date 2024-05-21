import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../utils/supabase";

const AuthComponent = () => {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={["google", "github", "slack"]}
      theme="dark"
      redirectTo="https://istcjbiceipwbvpsbzyh.supabase.co/auth/v1/callback"
    />
  );
};

export default AuthComponent;
