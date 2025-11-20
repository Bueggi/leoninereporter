import { NextResponse } from "next/server";

import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    const singlebooking = await prisma.booking.findFirst({
      where: {
        id,
      }
    });

    console.log(singlebooking)

    return NextResponse.json(
      { success: true, data: singlebooking },
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
