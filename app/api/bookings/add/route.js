import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import moment from "moment";

const handler = async (req, res) => {
  try {
    const {
      dispo,
      reach,
      start,
      end,
      product,
      rotation,
      tkp,
      campaignID,
      output,
      targeting,
    } = await req.json();

    // find campaign and return error if campaign does not exist

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignID },
    });
    if (!campaign)
      return NextResponse.json({
        success: false,
        message: "Diese Kampagne existiert nicht",
      });

    //update the campaign so the booking is included

    const createdBooking = await prisma.booking.create({
      data: {
        dispo,
        reach: +reach,
        start: moment(start).format(),
        targeting,
        end: moment(end).format(),
        product,
        rotation,
        tkp: +tkp,
        output,
        campaignID,
      },
    });

    return NextResponse.json(
      { success: true, data: createdBooking },
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
