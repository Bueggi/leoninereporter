import { NextResponse } from "next/server";
import prisma from '@lib/prisma'

const handler = async (req, { params }) => {
  try {
    const { id } = params;
    const booking = await prisma.booking.findFirst({where: {id}})
    if (!booking) return NextResponse.json({message: 'Diese Buchung existiert nicht', success: false}, {status: 500})

    const deletedbooking = await prisma.booking.delete({
      where: {
        id,
      }
    });

    return NextResponse.json(
      { success: true, data: deletedbooking },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Etwas ist schief gelaufen"},
      { status: 500 }
    );
  }
};

export { handler as DELETE };

