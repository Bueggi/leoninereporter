import { NextResponse } from "next/server";

const handler = async (req) => {
  // jobId und reportId aus der Anfrage auslesen
  const { token, downloadUrl } = await req.json();
  // Fehler ausgeben, wenn eine der beiden Variablen nicht angegeben wurde
  if (!token)
    return NextResponse.json(
      { message: "Du musst eine JobID und eine ReportID angeben" },
      { status: 400 }
    );
  try {
    const reportDownloadRes = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept-Encoding": "gzip",
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
};

export { handler as POST };
