import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Todo } from "../types/todo";

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState("");

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("todos").select();
    if (error) {
      setTodos([]);
      setError(error.message);
      return;
    }

    setTodos(data);
    setError("");
  };

  useEffect(() => {
    fetchTodos();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos", // Specify the table you're interested in
        },
        (payload) => {
          console.log("Received a change", payload);
          fetchTodos(); // Fetch latest todos on change
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchTodos();
  };

  return (
    <div>
      <h2>List of todos</h2>
      {todos.map((todo) => (
        <div
          key={todo.id}
          style={{
            backgroundColor: "#333232",
            padding: "16px 32px",
            borderRadius: "12px",
            margin: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              columnGap: "12px",
            }}
          >
            <h3>{todo.title}</h3>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </div>
          <p>{todo.created_at}</p>
        </div>
      ))}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default TodoList;
