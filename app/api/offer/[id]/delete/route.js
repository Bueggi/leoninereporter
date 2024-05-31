import { NextResponse } from "next/server";
import prisma from '@lib/prisma'

const handler = async (req, { params }) => {
  try {
    const { id } = params;
    const offer = await prisma.offer.findFirst({where: {id}})
    if (!offer) return NextResponse.json({message: 'Diese Buchung existiert nicht', success: false}, {status: 500})

    const deletedoffer = await prisma.offer.delete({
      where: {
        id,
      }
    });

    return NextResponse.json(
      { success: true, data: deletedoffer },
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

