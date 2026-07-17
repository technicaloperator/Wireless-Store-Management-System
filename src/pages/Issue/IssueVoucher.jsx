import {
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";
import "./IssueVoucher.css";

function numberToWords(num) {
  const ones = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];

  const tens = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  if (num < 20) return ones[num];

  if (num < 100) {
    return (
      tens[Math.floor(num / 10)] +
      (num % 10 ? " " + ones[num % 10] : "")
    );
  }

  return num.toString();
}

function expandNumbers(text) {
  if (!text) return [];

  const arr = [];

  text.split(",").forEach((part) => {
    part = part.trim();

    if (!part) return;

    if (part.includes("-")) {
      const [from, to] = part.split("-").map(Number);

      for (let i = from; i <= to; i++) {
        arr.push(i);
      }
    } else {
      arr.push(Number(part));
    }
  });

  return arr.sort((a, b) => a - b);
}

function makeRanges(text) {
  const numbers = expandNumbers(text);

  if (numbers.length === 0) return [];

  const ranges = [];

  let start = numbers[0];
  let end = numbers[0];

  for (let i = 1; i <= numbers.length; i++) {
    if (numbers[i] === end + 1) {
      end = numbers[i];
    } else {
      if (start === end) {
        ranges.push(start.toString());
      } else {
        ranges.push(`${start} TO ${end}`);
      }

      start = numbers[i];
      end = numbers[i];
    }
  }

  return ranges;
}

const IssueVoucher = forwardRef(({
  voucherNumber,
  issueDate,
  designation,
  policeStation,
  district,
  mobileVehicle = "",
  indentNo = "",
  indentDate = "",
  items = [],
  onClose,
}, ref) => {
  const printRef = useRef();
useImperativeHandle(ref, () => ({
  async downloadPdf(fileName) {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pdfHeight;

    while (heightLeft > 10) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName || voucherNumber}.pdf`);
  },
}));
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: voucherNumber,
  });

  const totalQty = items.reduce((sum, entry) => {
    if (entry.isExtra) {
      return sum + (entry.quantity || 0);
    }

    return sum + expandNumbers(entry.gpwNumbers).length;
  }, 0);

  const qtyWords = numberToWords(totalQty);

  return (
    <div className="voucher-overlay">

      <div className="voucher-page" ref={printRef}>

        {/* ================= HEADER ================= */}

        <div className="voucher-header">

          <h2>ગુજરાત રાજ્ય પોલીસ વાયરલેસ ગ્રીડ</h2>

          <h3>(સ્ટોર શાખા)</h3>

          <h1>જાવક વાઉચર</h1>

        </div>

        {/* ================= TOP DETAILS ================= */}

        <div className="voucher-top">

          <div>
            <b>No. :- </b>
            <span >{voucherNumber}</span>
          </div>

          <div>
            <b>Place :- </b>MORBI
          </div>

          <div>
            <b>Date :- </b>
            <span >{issueDate}</span>
          </div>

        </div>

        {/* ================= ADDRESS ================= */}

        <div className="voucher-address">

          <p>To,</p>

          <p ><b>{designation}</b></p>

          <p ><b>{policeStation}</b></p>

          {district && (
            <p ><b>{district}</b></p>
          )}

          {mobileVehicle && (
            <p ><b>({mobileVehicle})</b></p>
          )}

        </div>

        {/* ================= REFERENCE ================= */}
        <p className="voucher-reference">
          With reference to your Indent No.
          {indentNo ? ` ${indentNo}, ` : " _______________________________ " }
          Dated
          {indentDate ? ` ${indentDate} ` : " __________________ " }
          the following stores are
          issued and dispatched by PWSI Wireless Branch,
          Morbi.
        </p>

        {/* ================= TABLE ================= */}

        <table className="voucher-table">

          <thead>
            <tr>
              <th style={{ width: "8%" }}>SR.<br />NO.</th>
              <th style={{ width: "40%" }}>PARTICULARS</th>
              <th style={{ width: "18%" }}>QTY. ISSUED</th>
              <th style={{ width: "34%" }}>GPW NO. / SR. NO.</th>
            </tr>
          </thead>

          <tbody>
          {items.map((entry, index) => {
            const entryQty = entry.isExtra
              ? entry.quantity
              : expandNumbers(entry.gpwNumbers).length;
            const entryRanges = entry.isExtra
              ? []
              : makeRanges(entry.gpwNumbers);

            return (
              <tr key={`${entry.item}-${entry.company}-${index}`}>
                <td className="center">{index + 1}</td>
                <td>
                  <b>{entry.item}</b>
                  {entry.company ? ` - ${entry.company}` : ""}
                </td>
                <td className="center qty-cell">
                  {String(entryQty).padStart(2, "0")}
                  <br />
                  <span>({numberToWords(entryQty)})</span>
                </td>
                <td className="remarks-cell center">
                  <span className="remarks-text">
                    {entry.isExtra ? "-" : entryRanges.join(", ")}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>

        </table>

        {/* ================= RECEIVE NOTE ================= */}

    

        {/* ================= ISSUE SIGNATURES ================= */}

        <div className="signature-block">
          <div className="signature-left-group">
            <div className="signature-line-row">
              <span>Issued by</span>
              <div className="signature-line"></div>
            </div>
            <div className="signature-line-row">
              <span>Checked by</span>
              <div className="signature-line"></div>
            </div>
          </div>
        </div>

        <div className="signature-authority-row">
          <span>Issuing Authority</span>
          <div className="signature-line authority-line"></div>
        </div>

        <div className="receive-note receive-note-bold">
          The above stores are received correctly as per Col. No. 5
        </div>

        <div className="signature-block">
          <div className="signature-left-group">
            <div className="signature-line-row">
              <span>Received by</span>
              <div className="signature-line"></div>
            </div>
            <div className="signature-line-row">
              <span>Checked by</span>
              <div className="signature-line"></div>
            </div>
          </div>
        </div>

        <div className="signature-authority-row">
          <span>Receiving Authority</span>
          <div className="signature-line authority-line"></div>
        </div>

      </div>

      {/* ================= BUTTONS ================= */}

      <div className="voucher-buttons no-print">

        <button
          className="print-btn"
          onClick={handlePrint}
        >
          PRINT
        </button>

        <button
          className="close-btn"
          onClick={onClose}
        >
          CLOSE
        </button>

      </div>

    </div>

  );

});

export default IssueVoucher;