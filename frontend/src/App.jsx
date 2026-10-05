import { useEffect, useState } from "react";

// Se fija en build time (Vite). Ver VITE_API_URL en docker-compose.yml / render.yaml
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    fetch(`${API}/api/notes`)
      .then((r) => r.json())
      .then(setNotes)
      .catch(() => setError("No se pudo conectar con el backend"));

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await fetch(`${API}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    load();
  };

  const remove = async (id) => {
    await fetch(`${API}/api/notes/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <main>
      <h1>📝 Notas</h1>
      <p className="sub">React + Express + PostgreSQL, desplegado en Render</p>
      {error && <p className="error">{error}</p>}
      <form onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe una nota..." />
        <button>Agregar</button>
      </form>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <span>{n.text}</span>
            <button className="del" onClick={() => remove(n.id)}>✕</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
