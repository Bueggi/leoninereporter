"use client";
const Dashboard = () => {
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
    // const report = await reportRes.json();
    // console.log("report", report);

    //   const reportStatusRes = await fetch(
    //   "https://youtubereporting.googleapis.com/v1/jobs/54876ed0-32aa-4b8a-8df8-484d8976dde1/reports?onBehalfOfContentOwner=_NzgmdcDWuwDB6xqTRZ8QA",
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   }
    // );
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

    const getReport = await fetch(`${process.env.NEXT_PUBLIC_HOSTURL}/api/reports/singleReport`);
    const suspense = await getReport.json()
  };

  return (
    <div>
      <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Influencer Finder
      </h1>

      <button onClick={getData}>Klick mich fuer Finanzdaten</button>
    </div>
  );
};

export default Dashboard;
