import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const advertisers = await prisma.advertiser.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    const advertiserNames = advertisers.map(a => a.name);

    return NextResponse.json({ success: true, data: advertiserNames.sort() }, { status: 200 });
  } catch (error) {
    console.error("API Error fetching advertisers:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
