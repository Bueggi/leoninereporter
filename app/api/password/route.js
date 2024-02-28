import prisma from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const data = await req.json();
    if (data.password === process.env.PASSWORD) {
      return NextResponse.json(
        { success: true, message: "Das Passwort war korrekt" },
        { status: 200 }
      );
    } else
      return NextResponse.json(
        { success: false, message: "Das Passwort ist nicht korrekt" },
        { status: 500 }
      );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Das Passwort ist nicht korrekt" },
      { status: 500 }
    );
  }
}
