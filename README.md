This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
--------------------------------------------------------------------------------------------------------------------------------------------------------------
Full CRUD application in Next.js (App Router) using MongoDB and Mongoose involves setting up database caching, defining schemas, handling API Route Handlers, and interacting with them from React components

STEP 1:
Create Next JS Application and then go to https://www.mongodb.com/pricing sign up free account MongoDB Atlas

Terminal:
npx create-next-app@latest
------------------------------------------------------------------------

STEP 2:
Install Dependencies & Setup Environment
Install Mongoose (the Object Data Modeling library for MongoDB):

Terminal:
npm install mongoose
------------------------------------------------------------------------
------------------------------------------------------------------------

Folder & File Breakdown

STEP 3:
Create .env.local: Keeps your sensitive MongoDB connection string out of version control. Ensure this file is listed inside .gitignore.

CODE HERE:
MONGODB_URI=mongodb+srv://money2016cam_db_user:JChkaMuZV6e4xyAo@cluster0.at2ye35.mongodb.net
------------------------------------------------------------------------

STEP 4:
lib/db.js: Contains the logic to connect to MongoDB and cache the connection globally across API re-renders and hot reloads in development.

CODE HERE:

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}
------------------------------------------------------------------------

STEP 5:
models/Item.js: Holds your Mongoose schema defining the data structure (e.g., title, description) and exports the model safely without re-compiling errors.

CODE HERE:

import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
  },
  { timestamps: true }
);

// Prevent compiled model re-registration during Next.js hot-reloads
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
------------------------------------------------------------------------

STEP 6:
app/api/items/route.js: Handles collection-level API operations:
GET: Fetches all documents.
POST: Creates a new document.

CODE HERE:

import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { NextResponse } from "next/server";

// READ (Get all items)
export async function GET() {
  try {
    await connectDB();
    const items = await Item.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE (Add new item)
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newItem = await Item.create(body);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
------------------------------------------------------------------------

STEP 7:
app/api/items/[id]/route.js: Handles dynamic item-specific operations:
GET: Fetches a single document by its _id.
PUT: Updates a document by its _id.
DELETE: Removes a document by its _id.

CODE HERE:

import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { NextResponse } from "next/server";

// READ ONE
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const item = await Item.findById(id);
    if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// UPDATE
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updatedItem = await Item.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updatedItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Item deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
------------------------------------------------------------------------

STEP 8:
app/page.tsx: The React front-end page containing state, forms, and fetch requests to communicate with your API route handlers.

CODE HERE:

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
------------------------------------------------------------------------

Developed Code By: Vattanac
YouTube Channel
https://www.youtube.com/@masteritonline24h

Follow Like & Share Facebook
https://web.facebook.com/vattanactutorial
