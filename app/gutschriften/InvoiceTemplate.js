import campaigns from './campaigns.json'

const InvoiceTemplate = ({ order, info, timeframe }) => {
  let sum = 0;
  info.map(el => {
    let {booking} = el
    booking = booking.replace('€','')
    booking = booking.replace('.', '')
    booking = booking.replace(',', '.')
    booking = booking.trim()
    booking=parseFloat(booking)
    booking = +booking
    sum = sum+booking
  })
  const campaignInfo = campaigns.find(el => el.Kampagne === order)
  if (!campaignInfo) return <>Es konnte keine Kampagne gefunden werden</>



  const description = {
    "€15,00": "Nonskippable Ad (max. 20')",
    '€13,00': 'Skippable Ads',
    '€11,00' : "Nonskip Short Ads (max. 6')"
  }
  return (
    <div
      className="w-full flex flex-col"
      style={{ letterSpacing: "1px", fontFamily: "Arial" }}
    >
      <div className="flex justify-end">
        <img src="/LeonineLogo.png" />
      </div>

      <div className="flex flex-row mt-8">
        <div className="w-1/2">
          <div className="">
            <div className="text-xs mb-8">
              <p className="font-bold">LEONINE Licensing GmbH</p>
              <p>Taunusstr 21</p>
              <p>80807 München</p>
            </div>
          </div>
          <div className="text-xs">
            <p>Mediaplus International GmbH & Co KG</p>
            <p>Haus der Kommunikation</p>
            <p>Friedenstraße 24</p>
            <p>81671 München</p>
            <p>rechnungen@mediaplus.de</p>
          </div>
        </div>

        <div className="w-1/2">
          <div className="flex justify-end w-full">
            <div className="justify-end">
              <h2 className="mb-2 text-2xl font-bold">Kampagnen-Reporting</h2>
              <div className="text-xs">
                <p>Seite 1 von 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row bg-slate-100 mt-24 py-6 px-2">
        <div className="w-3/4">
          <div className="flex flex-row">
            <p className="mr-4 font-bold">Kunde:</p>{" "}
            <p>{campaignInfo.Kunde}</p>
          </div>
          <div className="flex flex-row">
            <p className="mr-4 font-bold">Produkt:</p>{" "}
            <p>{campaignInfo.Produkt}</p>
          </div>
          <div className="flex flex-row">
            <p className="mr-4 font-bold">Kampagne:</p>{" "}
            <p>{campaignInfo.Kampagne}</p>
          </div>
          <div className="flex flex-row">
            <p className="mr-4 font-bold">Onlinekampagne:</p>{" "}
            <p>{campaignInfo.Onlinekampagne}</p>
          </div>
        </div>
        <div className="w-1/4">
          <div className="flex flex-row">
            <p className="mr-4 font-bold">Auftragsnummer:</p>{" "}
            <p>{campaignInfo.Auftragsnummer}</p>
          </div>
          <div className="flex flex-row">
            <p className="mr-4 font-bold">Zeitraum:</p>{" "}
            <p>{timeframe}</p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex flex-row border-b-2 border-black py-2 font-bold">
          <div className="w-1/3">Beschreibung</div>
          <div className="w-1/5 text-right">DispoNr</div>
          <div className="w-1/5 text-right">Impressionen</div>
          <div className="w-1/5 text-right">TKP</div>
          <div className="w-1/5 text-right">Summe</div>
        </div>
        <div className="flex flex-col py-2">
          {info &&
            info.map((el, i) => {
             
              return (
                <div className="flex flex-row py-2" key={i}>
                  <div className="w-1/3">{description[el.rate]}</div>
                  <div className="w-1/5 text-right">{el.dispo}</div>
                  <div className="w-1/5 text-right">{el.impressions}</div>
                  <div className="w-1/5 text-right">{el.rate}</div>
                  <div className="w-1/5 text-right">{el.booking}</div>
                </div>
              );
            })}
        </div>
        <div className='font-bold text-xl text-right mt-8'>
          Total: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
    sum,
  )}
        </div>
      </div>

      <div className="text-center mt-48">
        <p className="text-xs">
          LEONINE Licensing GmbH, Taunusstr. 21, 80807 München, Tel. +49 89 999
          513 0 · www.leoninestudios.com · info@leoninestudios.com
        </p>
        <p className="text-xs">
          Geschäftsführer: Fred Kogel · Dr. Markus Frerker · Stephan Katzmann ·
          Sitz der Gesellschaft: München · Registergericht München HRB 272 911
        </p>
        <p className="text-xs">
          {" "}
          UniCredit Bank AG · IBAN DE83 7002 0270 0002 7620 80 · BIC HYVEDEMMXXX
          · UST-IdNr. DE 323 797 373
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
