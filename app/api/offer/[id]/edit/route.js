import { NextResponse } from "next/server";

import prisma from "../../../../../lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;
    const { start, end, reach, rotation, tkp, product } = await req.json();

    const offer = await prisma.offer.findFirst({ where: { id } });

    if (!offer)
      return NextResponse.json(
        { success: false, message: "Dieses Offer existiert nicht" },
        { status: 400 }
      );

    const updatedoffer = await prisma.offer.update({
      where: {
        id,
      },

      data: {
        start,
        end,
        reach: +reach,
        rotation,
        tkp: +tkp,
        product,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedoffer },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen" },
      { status: 500 }
    );
  }
};

export { handler as PUT };
