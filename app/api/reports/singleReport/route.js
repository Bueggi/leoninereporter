import { NextResponse } from "next/server";

export async function GET(req) {
  const token = "ya29.a0AcM612yKYpzIjn_9HHDi_H8929wAQXePe3OPiBUdqrbRBeNuIaNRFBTSp8-rcDj6Y_wsh0j0r_mbtV9NW3cYcjpze02AX5-EvHHf97g7pgJKQbjknAW4Dryziw-2POpOF4RUukyTUBFjIahuxSPXldRs3LUV0HRL4UAkQ09KaCgYKAS4SARESFQHGX2MiAJ_ylangJ3iP2ecY4EugEw0175"; // Ersetze dies durch dein tatsächliches OAuth 2.0 Token
  const downloadUrl =
    "https://youtubereporting.googleapis.com/v1/media/CONTENT_OWNER/_NzgmdcDWuwDB6xqTRZ8QA/jobs/54876ed0-32aa-4b8a-8df8-484d8976dde1/reports/11375421131?alt=media&onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA";

  try {
    const reportDownloadRes = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!reportDownloadRes.ok) {
      return NextResponse.json(
        { error: "Fehler beim Herunterladen des Berichts" },
        { status: reportDownloadRes.status }
      );
    }

    const reportData = await reportDownloadRes.text(); // Annahme: der Bericht ist im CSV-Format

    const response = new NextResponse(reportData, {
      headers: {
        "Content-Disposition": 'attachment; filename="report.csv"',
        "Content-Type": "text/csv",
      },
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Serverfehler beim Herunterladen des Berichts" },
      { status: 500 }
    );
  }
}
