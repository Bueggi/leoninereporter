import { NextResponse } from "next/server";

const handler = async (req) => {
  const { token } = await req.json();

  // Fehler ausgeben, wenn eine der beiden Variablen nicht angegeben wurde
  const accessToken = token;
  const contentOwnerId = "_NzgmdcDWuwDB6xqTRZ8QA";

  const url =
    `https://youtubeanalytics.googleapis.com/v2/reports?` +
    `dimensions=channel&` + // Erst nur eine Dimension testen
    `endDate=2023-10-31&` +
    `ids=contentOwner==${contentOwnerId}&` +
    `metrics=estimatedEarnings&` +
    `startDate=2023-10-01`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Fehler bei der Anfrage:", error);
    return NextResponse.json(
      { message: "Das hat nicht geklappt" },
      { status: 500 }
    );
  }
};

export { handler as POST };
