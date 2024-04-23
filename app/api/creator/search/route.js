import prisma from "@lib/prisma";
import { NextResponse } from "next/server";

const handler = async (req, res) => {
  try {
    const { searchstring } = await req.json();
    const result = await prisma.creator.findMany({
      where: {
        name: {
          contains: searchstring,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
};

export { handler as POST };
