import prisma from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: "elsa@prisma.io",
    },
  });

  console.log(existingUser);

  if (!existingUser) {
    const newUser = await prisma.user.create({
      data: {
        email: "elsa@prisma.io",
        name: "Elsa Prisma",
      },
    });
    return NextResponse.json({ success: true, data: newUser }, { status: 200 });
  }
  console.log("came here");
  return NextResponse.json(
    { success: false, message: "Etwas ist schief gelaufen" },
    { status: 400 }
  );
}
