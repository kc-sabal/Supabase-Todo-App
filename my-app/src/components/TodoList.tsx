import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Todo } from "../types/todo";

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState("");

  const [editTodo, setEditTodo] = useState<Todo | null>();

  const fetchTodos = async () => {
    const { data, error } = await supabase.from("todos").select();
    if (error) {
      setTodos([]);
      setError(error.message);
      return;
    }

    const sortedData = data.sort(
      (a: Todo, b: Todo) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setTodos(sortedData);
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
  };

  const handleMarkCompleted = async (id: number, isComplete: boolean) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const response = await fetch(
        "https://istcjbiceipwbvpsbzyh.supabase.co/functions/v1/updateTodoStatus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id, isComplete }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }
    } catch (err: any) {
      setError(err?.message || "");
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditTodo(todo);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTodo({
      ...(editTodo as Todo),
      title: e.target.value ?? "",
    });
  };

  const handleEditSave = async (id: number) => {
    console.log({ editTodo, id });
    const { data, error } = await supabase
      .from("todos")
      .update({ title: editTodo?.title })
      .eq("id", id);
    console.log(data);

    if (error) {
      setError(error.message);
      return;
    }
    setEditTodo(null);
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
            {editTodo?.id === todo.id ? (
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={editTodo.title ?? ""}
                  onChange={handleEditChange}
                  style={{ width: "100%", marginRight: "8px" }}
                />
                <button onClick={() => handleEditSave(todo.id)}>Save</button>
              </div>
            ) : (
              <>
                <h3>{todo.title}</h3>
                <div style={{ display: "flex", columnGap: "4px" }}>
                  <button
                    onClick={() =>
                      handleMarkCompleted(todo.id, !todo.isComplete as boolean)
                    }
                  >
                    {todo.isComplete ? "Incomplete" : "Complete"}
                  </button>
                  <button onClick={() => handleEdit(todo)}>Edit</button>
                  <button onClick={() => handleDelete(todo.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
          <p>
            {todo.created_at} -- {todo.isComplete?.toString()}
          </p>
        </div>
      ))}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default TodoList;
