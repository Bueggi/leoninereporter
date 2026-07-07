import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await prisma.inboundRequest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inbound request:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
