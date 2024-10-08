import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, res) => {
  try {
    const { campaignID } = await req.json();

    const offerGroup = await prisma.offerGroup.create({
      data: {
        campaignID,
      },
    });

    return NextResponse.json(
      { success: true, data: offerGroup },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as POST };
