import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
export const dynamic = 'force-dynamic';

const handler = async (req, res) => {
  try {
    const page = req.query?.page || 1;
    const skipPage = (page - 1) * process.env.NEXT_PUBLIC_MAX_RESULTS;
    const takePages = +process.env.NEXT_PUBLIC_MAX_RESULTS;

    const count = await prisma.booking.count()

    const data = await prisma.booking.findMany({ skip: skipPage, take: takePages });
    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as GET };
