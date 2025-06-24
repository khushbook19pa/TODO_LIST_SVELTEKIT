import { connectDB } from "$lib/db.js";
import { json } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const db = await connectDB();
    const todos = await db
      .collection("todos")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return json({
      success: true,
      todos: todos,
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST({ request }) {
  try {
    const db = await connectDB();
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return json(
        {
          success: false,
          error: "Todo text is required",
        },
        { status: 400 }
      );
    }

    const newTodo = {
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
    };

    const result = await db.collection("todos").insertOne(newTodo);
    const createdTodo = { _id: result.insertedId, ...newTodo };

    return json({
      success: true,
      todo: createdTodo,
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT({ request }) {
  try {
    const db = await connectDB();
    const { id, text } = await request.json();

    if (!id) {
      return json(
        {
          success: false,
          error: "Todo ID is required",
        },
        { status: 400 }
      );
    }

    if (!text || !text.trim()) {
      return json(
        {
          success: false,
          error: "Todo text is required",
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection("todos")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { text: text.trim(), updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return json(
        {
          success: false,
          error: "Todo not found",
        },
        { status: 404 }
      );
    }

    const updatedTodo = await db
      .collection("todos")
      .findOne({ _id: new ObjectId(id) });

    return json({
      success: true,
      todo: updatedTodo,
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE({ request }) {
  try {
    const db = await connectDB();
    const { id } = await request.json();

    if (!id) {
      return json(
        {
          success: false,
          error: "Todo ID is required",
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection("todos")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return json(
        {
          success: false,
          error: "Todo not found",
        },
        { status: 404 }
      );
    }

    return json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
