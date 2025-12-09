import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

// 1. WICHTIG: Das hier zwingt Next.js, den Cache abzuschalten.
// Damit siehst du sofort gelöschte oder neue Kampagnen.
export const dynamic = 'force-dynamic';

export async function GET(req) { // 'res' gibt es im App Router nicht mehr
  try {
    // 2. FIX: Im App Router holt man Query-Params so:
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;

    // Sicherheits-Check, falls env variable fehlt
    const maxResults = Number(process.env.NEXT_PUBLIC_MAX_RESULTS) || 10;

    const skipPage = (page - 1) * maxResults;
    const takePages = maxResults;

    const count = await prisma.campaign.count();

    const data = await prisma.campaign.findMany({
      skip: skipPage,
      take: takePages,
      orderBy: {
        createdAt: 'desc', // OPTIONAL: Sortiert die neuesten nach oben
      },
      include: {
        bookings: {
          select: {
            start: true,
            end: true,
            reach: true,
            tkp: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error); // Logge den Fehler im Server-Terminal
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}