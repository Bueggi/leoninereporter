import { NextResponse } from "next/server";

import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;
    const singleCreator = await prisma.creator.findUnique({
      where: {
        id,
      }
    });

    return NextResponse.json(
      { success: true, data: singleCreator },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as GET };
