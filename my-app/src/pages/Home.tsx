import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import AuthComponent from "../components/Auth";

const Home = () => {
  const [session, setSession] = useState<Session>();
  const navigate = useNavigate();

  async function signOut() {
    const { error } = await supabase.auth.signOut();
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as Session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as Session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAdd = () => {};

  if (!session) {
    return <AuthComponent />;
  } else {
    return (
      <div>
        <button onClick={signOut}>Sign out</button>

        <div
          style={{
            display: "flex",
            minWidth: "1000px",
            minHeight: "600px",
            justifyContent: "space-around",
          }}
        >
          <TodoForm onAdd={handleAdd} />
          <TodoList />
        </div>
      </div>
    );
  }
};

export default Home;
