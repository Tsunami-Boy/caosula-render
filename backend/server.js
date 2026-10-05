import express from "express";
import cors from "cors";
import pg from "pg";

const PORT = process.env.PORT || 3000; // Render inyecta PORT
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // La URL interna de Render no requiere SSL; la externa sí (DATABASE_SSL=true)
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check (Render lo usa para saber si el servicio está vivo)
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "db_unavailable" });
  }
});

app.get("/api/notes", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(rows);
});

app.post("/api/notes", async (req, res) => {
  const text = (req.body?.text ?? "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });
  const { rows } = await pool.query(
    "INSERT INTO notes (text) VALUES ($1) RETURNING *",
    [text]
  );
  res.status(201).json(rows[0]);
});

app.delete("/api/notes/:id", async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

async function initDb(retries = 10) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
      return;
    } catch (err) {
      console.log(`DB no lista (${i}/${retries}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("No se pudo conectar a la base de datos");
}

await initDb();
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
