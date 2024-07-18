import { PDFDownloadLink, Document, Page } from '@react-pdf/renderer';
import { toast } from "react-toastify";
import html2PDF from "jspdf-html2canvas";
import OfferTemplate from "./OfferTemplate";
import generatePDF, { usePDF, Resolution, Margin } from 'react-to-pdf';  

// deleteOfferGroup
// Mit dieser Funktion wird die Offergroup geloescht
const deleteOfferGroup = async (id, state, setState) => {
  try {
    // hitte den Endpunkt, um die Offergroup zu loeschen
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/offergroup/${id}/delete`,
      {
        method: "DELETE",
      }
    );

    const { data, message } = await res.json();
    if (!res.ok) return toast.error(message);

    setState({
      ...state,
      offers: state.offers.filter((el) => el.id !== id),
    });

    return toast.success("Das Angebot wurde erfolgreich gelöscht");
  } catch (error) {
    toast.error(error);
  }
};

// addOfferGroup
// Mit dieser Funktion wird eine neue Offergroup angelegt
const addOfferGroup = async (campaignID, state, setState) => {
  try {
    // hitte den Endpunkt, der eine neue OfferGroup anlegt
    // uebermittle die Information als POST mit der campaignID im body
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/offergroup/add`,
      {
        method: "POSt",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignID }),
      }
    );
    // auslesen den Rueckgabewerts
    // Wenn beim Anlegen der Kampagne etwas schief laeuft, wird ein Fehler ausgegeben
    const { data, message } = await res.json();
    if (!res.ok) return toast.error(message);

    data.offers = [];

    // Wenn alles ok ist, managen wir auch noch den State
    setState({
      ...state,
      offers: [...state.offers, data],
    });

    return toast.success("Das Angebot wurde erfolgreich angelegt");
  } catch (error) {
    toast.error(error);
  }
};

// getCampaign
// getCampaign fragt aus der Datenbank die richtige Kampagne fuer die Darstellung auf der Seite an
const getcampaign = async (id, setcampaign, setLoading) => {
  try {
    const chosencampaignRes = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/campaign/${id}/list`
    );

    if (!chosencampaignRes.ok) {
      setLoading(false);
      return toast.error(message);
    }

    const { data, message } = await chosencampaignRes.json();

    setcampaign(data);
    setLoading(false);
  } catch (error) {
    setLoading(false);
    return toast.error(error);
  }
};

const deleteOffer = async (id, state, setState) => {
  try {
    const offerToDelete = await fetch(
      `${process.env.NEXT_PUBLIC_HOSTURL}/api/offer/${id}/delete`,
      {
        method: "DELETE",
      }
    );

    if (!offerToDelete.ok) {
      return toast.error(message);
    }

    const { data, message } = await offerToDelete.json();

    const newState = {
      ...state,
      offers: state.offers.map((offerGroup) => {
        return {
          ...offerGroup,
          offers: offerGroup.offers.filter((el) => el.id !== id),
        };
      }),
    };

    setState(newState);
    return toast.success("Das Angebot wurde gelöscht");
  } catch (error) {
    return toast.error(error);
  }
};

const exportAsPODF = async (offer, setOfferArray, name) => {
  const MyDoc = () => (
    <Document>
      <Page>
        // My document data
      </Page>
    </Document>
  );
 
//   const options = {  
//     // default is `save`  
//     method: 'open',  
//     // default is Resolution.MEDIUM = 3, which should be enough, higher values  
//     // increases the image quality but also the size of the PDF, so be careful  
//     // using values higher than 10 when having multiple pages generated, it  
//     // might cause the page to crash or hang.  
//     resolution: Resolution.HIGH,  
//     page: {  
//        // margin is in MM, default is Margin.NONE = 0  
//        margin: Margin.SMALL,  
//        // default is 'A4'  
//        format: 'A4',  
//        // default is 'portrait'  
//        orientation: 'landscape',  
//     },  
//     canvas: {  
//        // default is 'image/jpeg' for better size performance  
//        mimeType: 'image/png',  
//        qualityRatio: 1  
//     },  
//     // Customize any value passed to the jsPDF instance and html2canvas  
//     // function. You probably will not need this and things can break,   
//     // so use with caution.  
//     overrides: {  
//        // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options  
//        pdf: {  
//           compress: true  
//        },  
//        // see https://html2canvas.hertzen.com/configuration for more options  
//        canvas: {  
//           useCORS: true  
//        }  
//     },  
//  };  


//  const finalOffer = <OfferTemplate offer={offer} />;
//  setOfferArray([finalOffer]);
//  sleep(500).then(() => {
//     let page = document.getElementsByTagName("body");
//     generatePDF(page, options)
//     // html2PDF(page, {
//     //   jsPDF: {
//     //     format: "a5",
//     //     orientation: "landscape",
//     //   },
//     //   imageType: "image/png",
//     //   output: `./${name}.pdf`,
//     // });
//     sleep(500).then(() => setOfferArray([]));
//   // }
// );

  return;

  // setOfferArray([]);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export {
  deleteOfferGroup,
  getcampaign,
  addOfferGroup,
  deleteOffer,
  exportAsPODF,
};
