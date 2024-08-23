import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@lib/prisma";

// Dieser Handler gibt das User-Objekt aus der Datenbank zurück
// METHOD: GET
// args: NONE - Die Session wird zur Authentication genutzt
// returns Object {success: BOOLEAN, data?, message?}
const handler = async (req, res) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 }
      );
    }

    console.log(session)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user) {
      return NextResponse.json({ success: true, data: user });
    }

    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 }
    );


  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 501 });
  }

};

export { handler as GET };
