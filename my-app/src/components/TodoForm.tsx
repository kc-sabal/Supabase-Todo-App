import { useState } from "react";
import { supabase } from "../utils/supabase";

const TodoForm = ({ onAdd }: { onAdd: () => void }) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("todos").insert({ title });
    if (error) {
      setError(error.message);
      return;
    }
    setTitle("");
    setError("");
    onAdd();
  };

  return (
    <div style={{ width: "320px" }}>
      <h2>Add todo</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "12px" }}
          placeholder="Add a new todo"
        />
        <button type="submit">Submit</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default TodoForm;
