import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- SUPABASE CLIENT ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// --- HEALTH CHECK ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- LOGIN ROUTE (temporary, until Supabase OTP auth is wired) ---
app.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, email, display_name")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.json({
      message: "Login lookup successful",
      user: {
        id: data.user_id,
        email: data.email,
        display_name: data.display_name,
      },
    });

  } catch (err) {
    console.error("Login server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// --- GET ALL CLOTHING ITEMS ---
app.get("/items", async (req, res) => {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*");

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// --- ADD A NEW CLOTHING ITEM ---
app.post("/items", async (req, res) => {
  const { user_id, name, category, color, season } = req.body;

  const { data, error } = await supabase
    .from("clothing_items")
    .insert([{ user_id, name, category, color, season }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// --- CLOTHING ROUTES (per openapi.yaml) ---
app.get("/clothing", async (req, res) => {
  const { data, error } = await supabase
    .from("clothing_items")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/clothing", async (req, res) => {
  const { user_id, name, category, color, season } = req.body;

  const { data, error } = await supabase
    .from("clothing_items")
    .insert([{ user_id, name, category, color, season }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.get("/clothing/:id", async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("item_id", id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Item not found" });
  res.json(data);
});

app.put("/clothing/:id", async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  const { data, error } = await supabase
    .from("clothing_items")
    .update(updates)
    .eq("item_id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (!data || !data[0]) return res.status(404).json({ error: "Item not found" });
  res.json(data[0]);
});

app.delete("/clothing/:id", async (req, res) => {
  const id = req.params.id;

  const { error } = await supabase
    .from("clothing_items")
    .delete()
    .eq("item_id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// --- OUTFIT ROUTES ---
app.get("/outfits", async (req, res) => {
  const { data, error } = await supabase
    .from("outfits")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/outfits", async (req, res) => {
  const { user_id, name, rating, is_favorite } = req.body;

  const { data, error } = await supabase
    .from("outfits")
    .insert([{ user_id, name, rating, is_favorite }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.get("/outfits/:id", async (req, res) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("outfit_id", id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Outfit not found" });
  res.json(data);
});

app.put("/outfits/:id", async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  const { data, error } = await supabase
    .from("outfits")
    .update(updates)
    .eq("outfit_id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  if (!data || !data[0]) return res.status(404).json({ error: "Outfit not found" });
  res.json(data[0]);
});

app.delete("/outfits/:id", async (req, res) => {
  const id = req.params.id;

  const { error } = await supabase
    .from("outfits")
    .delete()
    .eq("outfit_id", id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// --- TAG ROUTES ---
app.get("/tags", async (req, res) => {
  const { data, error } = await supabase
    .from("tags")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/tags", async (req, res) => {
  const { name, type } = req.body;

  const { data, error } = await supabase
    .from("tags")
    .insert([{ name, type }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// --- COLLECTION ROUTES ---
app.get("/collections", async (req, res) => {
  const { data, error } = await supabase
    .from("collections")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/collections", async (req, res) => {
  const { user_id, name, description } = req.body;

  const { data, error } = await supabase
    .from("collections")
    .insert([{ user_id, name, description }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// --- POST ROUTES (feed) ---
app.get("/posts", async (req, res) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/posts", async (req, res) => {
  const { user_id, outfit_id, caption, is_visible } = req.body;

  const { data, error } = await supabase
    .from("posts")
    .insert([{ user_id, outfit_id, caption, is_visible }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
