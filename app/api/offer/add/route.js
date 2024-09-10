import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import moment from "moment";

const handler = async (req, res) => {
  try {
    const {
      reach,
      start,
      end,
      product,
      rotation,
      tkp,
      output,
      targeting,
      plz,
      age,
      platform,
      offerGroupID,
      frequencyCap
    } = await req.json();

    console.log('got hit')

    // find offerGroup and return error if offerGroup does not exist
    const offerGroup = await prisma.offerGroup.findUnique({
      where: { id: offerGroupID },
    });
    if (!offerGroup)
      return NextResponse.json({
        success: false,
        message: "Diese Kampagne existiert nicht",
      });

    //update the offerGroup so the offer is included

    const createdoffer = await prisma.offer.create({
      data: {
        reach: +reach,
        start: moment(start).format(),
        end: moment(end).format(),
        product,
        rotation,
        tkp: +tkp,
        output,
        targeting,
        offerGroupID,
        plz,
        age,
        platform,
        frequencyCap
      },
    });

    return NextResponse.json(
      { success: true, data: createdoffer },
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
