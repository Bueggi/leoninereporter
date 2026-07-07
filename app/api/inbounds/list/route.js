import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inbounds = await prisma.inboundRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: inbounds });
  } catch (error) {
    console.error("Error fetching inbounds:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
