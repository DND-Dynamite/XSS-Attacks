import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simulated Database for Stored XSS
  const messages = [
    { id: 1, text: "Welcome to the guestbook!", author: "Admin" },
    { id: 2, text: "This is a safe message.", author: "User1" }
  ];

  // --- API Routes ---

  // Stored XSS Endpoint
  app.get("/api/messages", (req, res) => {
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { text, author } = req.body;
    const newMessage = {
      id: messages.length + 1,
      text, // Vulnerable: No sanitization
      author
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  });

  // Reflected XSS Endpoint
  // This route echoes back the query parameter in a way that the frontend might render unsafely
  app.get("/api/search", (req, res) => {
    const query = req.query.q || "";
    // In a real reflected XSS scenario, the server might return HTML directly
    // Here we'll return a JSON response that the frontend renders using dangerouslySetInnerHTML
    res.json({ query });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
