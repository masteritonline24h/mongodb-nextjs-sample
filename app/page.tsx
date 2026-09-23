"use client";

import { useCallback, useEffect, useState } from "react";

type Item = {
  _id: string;
  title: string;
  description: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      const json = await res.json();

      if (json.success) {
        setItems(json.data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchItems();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      await fetch(`/api/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    }

    setTitle("");
    setDescription("");
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    await fetchItems();
  };

  const handleEdit = (item: Item) => {
    setEditingId(item._id);
    setTitle(item.title);
    setDescription(item.description);
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>MongoDB CRUD with Next.js</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">{editingId ? "Update Item" : "Add Item"}</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item._id} style={{ borderBottom: "1px solid #ccc", padding: "0.5rem 0" }}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <button onClick={() => handleEdit(item)}>Edit</button>{" "}
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
