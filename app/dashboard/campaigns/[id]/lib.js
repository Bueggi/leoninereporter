import { toast } from "react-toastify";
import html2PDF from 'jspdf-html2canvas';

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

export const Document = ({ props }) => {
  return (
    <div>
      <PageTop>
        <span>Hello #1</span>
      </PageTop>
      <div>Hello #2</div>
      <PageBottom>
        <div className="text-gray-400 text-sm">Hello #3</div>
      </PageBottom>
      <PageBreak />
      <span>Hello #4, but on a new page ! </span>
    </div>
  );
};

const exportAsPODF = async (offer) => {
  console.log(offer)
  // let page = document.getElementById('testID');
  // html2PDF(page, {
  //   jsPDF: {
  //     format: 'a5',
  //     orientation: 'landscape'
  //   },
  //   imageType: 'image/png',
  //   output: './pdf/generate.pdf'
  // });
};

export {
  deleteOfferGroup,
  getcampaign,
  addOfferGroup,
  deleteOffer,
  exportAsPODF,
};
