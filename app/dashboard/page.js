"use client";
import { Suspense, useState } from "react";
import LoadingSkeletonList from "../../lib/loading/LoadingSkeletonList";
import {
  ArrowDownTrayIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [reportList, setReportList] = useState([]);

  const fetchChannelEarnings = async () => {
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/users/me`
    );
    const user = await userRes.json();

    const token = user.data.access_token;
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTURL}/api/reports/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token})
    })
  

  }



  const getData = async () => {
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/users/me`
    );
    const user = await userRes.json();

    const token = user.data.access_token;

    // const reportTypesRes = await fetch(
    //   "https://youtubereporting.googleapis.com/v1/reportTypes?onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA",
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   }
    // );

    // const reportTypes = await reportTypesRes.json();
    // console.log(reportTypes);

    // const reportRes = await fetch(
    //   "https://youtubereporting.googleapis.com/v1/jobs?onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA",
    //   {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       name: "Umsatzbericht pro Kanal",
    //       reportTypeId: "content_owner_estimated_revenue_a1",
    //       createTime: "2024-08-22T00:00:00Z",
    //     }),
    //   }
    // );

    // const reports = reportRes.json()
    // console.log(reportRes)

    const reportStatusRes = await fetch(
      "https://youtubereporting.googleapis.com/v1/jobs/54876ed0-32aa-4b8a-8df8-484d8976dde1/reports?onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // https://youtubereporting.googleapis.com/v1/jobs/54876ed0-32aa-4b8a-8df8-484d8976dde1/reports/54876ed0-32aa-4b8a-8df8-484d8976dde1?onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA
    // https://youtubereporting.googleapis.com/v1/media/CONTENT_OWNER/_NzgmdcDWuwDB6xqTRZ8QA/jobs/54876ed0-32aa-4b8a-8df8-484d8976dde1/reports/11375386548?alt=media&onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA
    // const reportStatusRes2 = await fetch(
    //   "https://youtubereporting.googleapis.com/v1/jobs/54876ed0-32aa-4b8a-8df8-484d8976dde1/reports/11375421131?onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA",
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   }
    // );

    const reportStatus = await reportStatusRes.json();
    console.log(reportStatus);
    setReportList(reportStatus.reports);

    // const getReport = await fetch(`${process.env.NEXT_PUBLIC_HOSTURL}/api/reports/singleReport`);
    // const suspense = await getReport.json()
  };

  const handleDownloadButtonClick = async (downloadUrl) => {
    // get the users token
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/users/me`
    );
    const user = await userRes.json();
    const token = user.data.access_token;

    const downloadReportRes = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/reports/singleReport`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          downloadUrl,
        }),
      }
    );

    if (!downloadReportRes.ok) {
      console.error("Fehler beim Herunterladen des Berichts");
      return;
    }

    // Den CSV-Text von der Antwort holen
    const reportData = await downloadReportRes.text();

    // Convert CSV text to JSON
    const csvToJson = (csvText) => {
      console.log(csvText);
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",");
      const jsonData = lines.slice(1).map((line) => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index] ? values[index].trim() : null; // Sicherstellen, dass Werte vorhanden sind
        });
        return obj;
      });
      return jsonData;
    };

    // Wandelt die Daten aus dem csv in JSON um, das wir dann in die DB schreiben koennen
    const reportJson = csvToJson(reportData);

    const revPerChannel = {};

    reportJson.map((el) => {
      if (!revPerChannel[el.channel_id]) {
        // Neues Objekt für den Channel erstellen und Werte als Float speichern
        revPerChannel[el.channel_id] = {
          ad_auction: parseFloat(el.estimated_partner_ad_auction_revenue) || 0,
          ad_reserved:
            parseFloat(el.estimated_partner_ad_reserved_revenue) || 0,
          ad_revenue: parseFloat(el.estimated_partner_ad_revenue) || 0,
          red_revenue: parseFloat(el.estimated_partner_red_revenue) || 0,
          partner_revenue: parseFloat(el.estimated_partner_revenue) || 0,
          transaction_revenue:
            parseFloat(el.estimated_partner_transaction_revenue) || 0,
          yt_ad_revenue: parseFloat(el.estimated_youtube_ad_revenue) || 0,
        };
      } else {
        // Werte addieren, falls der Channel bereits existiert und Werte als Float konvertieren
        revPerChannel[el.channel_id].ad_auction +=
          parseFloat(el.estimated_partner_ad_auction_revenue) || 0;
        revPerChannel[el.channel_id].ad_reserved +=
          parseFloat(el.estimated_partner_ad_reserved_revenue) || 0;
        revPerChannel[el.channel_id].ad_revenue +=
          parseFloat(el.estimated_partner_ad_revenue) || 0;
        revPerChannel[el.channel_id].red_revenue +=
          parseFloat(el.estimated_partner_red_revenue) || 0;
        revPerChannel[el.channel_id].partner_revenue +=
          parseFloat(el.estimated_partner_revenue) || 0;
        revPerChannel[el.channel_id].transaction_revenue +=
          parseFloat(el.estimated_partner_transaction_revenue) || 0;
        revPerChannel[el.channel_id].yt_ad_revenue +=
          parseFloat(el.estimated_youtube_ad_revenue) || 0;
      }
    });

    console.log(revPerChannel);

    // // Hier erzeugst du einen Blob mit den CSV-Daten
    // const blob = new Blob([reportData], { type: "text/csv" });

    // // Eine temporäre URL für den Blob erzeugen
    // const url = window.URL.createObjectURL(blob);

    // // Einen unsichtbaren Download-Link erstellen
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "report.csv"; // Dateiname der heruntergeladenen Datei
    // document.body.appendChild(a); // Füge den Link zum DOM hinzu
    // a.click(); // Simuliere den Klick auf den Download-Link
    // document.body.removeChild(a); // Entferne den Link danach wieder aus dem DOM
    // // getData()
  };

  return (
    <div>
      <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Influencer Finder
      </h1>

      <div className="max-w-2xl">
        <div>
          <ul className="divide-y divide-gray-100">
            {reportList.map((el, i) => {
              return (
                <li className="flex flex-row gap-12">
                  <div>JobId: {el.jobId}</div>
                  <div>ReportID: {el.id}</div>

                  <ArrowDownTrayIcon
                    className="text-slate-600 w-4 h-4 cursor-pointer"
                    // onClick={() => handleDownloadButtonClick(el.downloadUrl)}
                    onClick={()=>fetchChannelEarnings()}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <button onClick={fetchChannelEarnings}>Klick mich fuer Finanzdaten</button>
    </div>
  );
};

export default Dashboard;
