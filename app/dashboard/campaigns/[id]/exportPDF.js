import { jsPDF } from "jspdf";

// Default export is a4 paper, portrait, using millimeters for units
const doc = new jsPDF();

const saveAsPDF = (content, filename) => {

  doc.text("Hello world!", 10, 10);
  doc.save(filename + ".pdf");
};

export default saveAsPDF