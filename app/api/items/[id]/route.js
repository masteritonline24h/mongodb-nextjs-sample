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
