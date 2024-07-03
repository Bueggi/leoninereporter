import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, res) => {
  try {
    const data = await prisma.advertiser.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    const count = await prisma.advertiser.count();
    return NextResponse.json({ success: true, data, count }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as GET };
