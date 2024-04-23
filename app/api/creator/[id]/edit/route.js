import { NextResponse } from "next/server";

import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    const {
      channelName,
      channelID,
      share,
      company,
      goal,
      demographics,
      anbindung,
      image,
    } = await req.json();

    const checkArray = [ channelName,
      channelID,
      share,
      company,
      goal,
      demographics,
      anbindung,
      image,]

      console.log( channelName,
        channelID,
        share,
        company,
        goal,
        anbindung,
        image,)

    if (checkArray.some(el => el === undefined))
      return NextResponse.json(
        { success: false, message: "Es wurden nicht alle Daten angegeben" },
        { status: 400 }
      );

    const updatedCreator = await prisma.creator.update({
      where: {
        id,
      },

      data: {
        channelName,
        channelID,
        share: +share,
        company,
        goal: +goal,
        demographics,
        anbindung,
        image,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedCreator },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as PUT };