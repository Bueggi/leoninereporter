import { NextResponse } from "next/server";

import prisma from "../../../../../lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;
    console.log("came here");
    const { name } = await req.json();

    if (!name)
      return NextResponse.json(
        { success: false, message: "Es wurde kein Name angegeben" },
        { status: 400 }
      );

    const updatedAdvertiser = await prisma.advertiser.update({
      where: {
        id,
      },

      data: {
        name,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedAdvertiser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen"},
      { status: 500 }
    );
  }
};

export { handler as PUT };