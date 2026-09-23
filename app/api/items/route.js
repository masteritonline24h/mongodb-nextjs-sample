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
