import { useRef } from "react";
import "./IssueVoucherSVG.css";

function IssueVoucherSVG({
  voucherNumber,
  issueDate,
  designation,
  policeStation,
  district,
  issuedItems = [],
  onClose,
}) {
  const printRef = useRef();

  const printVoucher = () => {
    const content = printRef.current.innerHTML;

    const win = window.open("", "", "width=900,height=1200");

    win.document.write(`
      <html>
      <head>
        <title>Issue Voucher</title>
        <link rel="stylesheet" href="${window.location.origin}/IssueVoucherSVG.css">
        <style>
          body{
            margin:0;
            background:#fff;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);

    win.document.close();

    win.onload = () => {
      win.print();
      win.close();
    };
  };

  return (
    <div className="voucher-overlay">

      <div className="voucher-window">

        <div ref={printRef}>

          <svg
            width="794"
            height="1123"
            viewBox="0 0 794 1123"
            className="voucher-svg"
          >

            {/* PAGE */}

            <rect
              x="10"
              y="10"
              width="774"
              height="1103"
              fill="white"
              stroke="black"
              strokeWidth="1"
            />

            {/* HEADER */}

            <text
              x="397"
              y="60"
              textAnchor="middle"
              className="guj-header"
            >
              ગુજરાત રાજ્ય પોલીસ વાયરલેસ ગ્રીડ
            </text>

            <line
              x1="240"
              y1="66"
              x2="555"
              y2="66"
              stroke="black"
              strokeWidth="1"
            />

            <text
              x="397"
              y="95"
              textAnchor="middle"
              className="guj-sub"
            >
              (સ્ટોર શાખા)
            </text>

            <line
              x1="330"
              y1="101"
              x2="465"
              y2="101"
              stroke="black"
              strokeWidth="1"
            />

            <text
  x="397"
  y="140"
  textAnchor="middle"
  className="voucher-title"
>
  જાવક વાઉચર
</text>

{/* ================= TOP DETAILS ================= */}

<text x="40" y="185" className="normalText">
  No. :-
</text>

<text x="90" y="185" className="redText">
  {voucherNumber}
</text>

<text
  x="397"
  y="185"
  textAnchor="middle"
  className="normalText"
>
  Place :- MORBI
</text>

<text x="620" y="185" className="normalText">
  Date :-
</text>

<text x="680" y="185" className="redText">
  {issueDate}
</text>

{/* ================= TO ================= */}

<text x="40" y="235" className="normalText">
  To,
</text>

<text x="40" y="270" className="redText">
  {designation}
</text>

<text x="40" y="300" className="redText">
  {policeStation}
</text>

{district && (
  <text x="40" y="330" className="redText">
    {district}
  </text>
)}

{/* ================= REFERENCE ================= */}

<text x="40" y="385" className="normalText">
  With reference to your indent No.
</text>

<line
  x1="245"
  y1="380"
  x2="470"
  y2="380"
  stroke="black"
  strokeWidth="1"
/>

<text x="480" y="385" className="normalText">
  Dated
</text>

<line
  x1="535"
  y1="380"
  x2="640"
  y2="380"
  stroke="black"
  strokeWidth="1"
/>

<text x="40" y="420" className="normalText">
  The following stores are issued and dispatched by PWSI Wireless Branch, Morbi.
</text>

</svg>

        </div>

        <div className="voucher-buttons">

          <button onClick={printVoucher}>
            PRINT
          </button>

          <button onClick={onClose}>
            CLOSE
          </button>

        </div>

      </div>

    </div>
  );
}

export default IssueVoucherSVG;