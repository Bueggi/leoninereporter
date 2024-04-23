import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, res) => {
  try {
    const url = new URL(req.url)
    const page = +url.searchParams.get("page") || 1
    const skipPage = (page - 1) * process.env.NEXT_PUBLIC_MAX_RESULTS;
    const takePages = +process.env.NEXT_PUBLIC_MAX_RESULTS;
    const data = await prisma.creator.findMany({ skip: skipPage, take: takePages });
    const count = await prisma.creator.count()
    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as GET };
