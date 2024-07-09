import { NextResponse } from "next/server";

import prisma from "../../../../../lib/prisma";
import moment from "moment";

const handler = async (req) => {
  try {
    const { booking } = await req.json();
    const {
      dispo,
      reach,
      start,
      end,
      product,
      rotation,
      tkp,
      targeting,
      output,
    } = booking;

    const updatedbooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },

      data: {
        dispo,
        reach: +reach,
        start: moment(start).format(),
        end: moment(end).format(),
        product,
        rotation,
        tkp: +tkp,
        targeting,
        output,
      },
    });

    return NextResponse.json(
      { success: true, data: updatedbooking },
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
