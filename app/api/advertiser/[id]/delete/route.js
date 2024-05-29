import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

const handler = async (req, { params }) => {
  try {
    const { id } = params;

    const deletedAdvertiser = await prisma.advertiser.delete({
      where: {
        id,
      },
    });
    return NextResponse.json(
      { success: true, data: deletedAdvertiser },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export { handler as DELETE };
