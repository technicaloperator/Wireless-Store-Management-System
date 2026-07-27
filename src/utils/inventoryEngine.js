/* ==========================================================
   WIRELESS STORE MANAGEMENT SYSTEM
   INVENTORY ENGINE
========================================================== */

export function createItem({
  item,
  company,
  number,
  numberType,
}) {
  return {
    id: Date.now() + Math.random(),

    item,

    company,

    number,

    numberType,

    status: "AVAILABLE",

    currentLocation: "WIRELESS STORE",

    issueTo: "",

    designation: "",

    policeStation: "",

    district: "",

    issueVoucher: "",

    issueDate: "",

    history: [
      {
        action: "ITEM ADDED",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      },
    ],
  };
}



/* ==========================================================
   ISSUE ITEM
========================================================== */

export function issueItem(
  inventory,
  itemId,
  issueData
) {

  return inventory.map((item) => {

    if (item.id !== itemId) return item;

    return {

      ...item,

      status: "ISSUED",

      currentLocation:
        issueData.policeStation,

      issueTo:
        issueData.designation,

      designation:
        issueData.designation,

      policeStation:
        issueData.policeStation,

      district:
        issueData.district,

      issueVoucher:
        issueData.voucherNo,

      issueDate:
        issueData.date,

      history: [

        ...item.history,

        {

          action: "ISSUED",

          voucher: issueData.voucherNo,

          date: issueData.date,

          designation:
            issueData.designation,

          policeStation:
            issueData.policeStation,

          district:
            issueData.district,

        },

      ],

    };

  });

}



/* ==========================================================
   RECEIVE ITEM
========================================================== */

export function receiveItem(
  inventory,
  itemId
) {

  return inventory.map((item) => {

    if (item.id !== itemId) return item;

    return {

      ...item,

      status: "AVAILABLE",

      currentLocation:
        "WIRELESS STORE",

      issueTo: "",

      designation: "",

      policeStation: "",

      district: "",

      issueVoucher: "",

      issueDate: "",

      history: [

        ...item.history,

        {

          action: "RECEIVED",

          date:
            new Date().toLocaleDateString(),

        },

      ],

    };

  });

}



/* ==========================================================
   FAULTY
========================================================== */

export function faultyItem(
  inventory,
  itemId
) {

  return inventory.map((item) => {

    if (item.id !== itemId) return item;

    return {

      ...item,

      status: "FAULTY",

      history: [

        ...item.history,

        {

          action: "FAULTY",

          date:
            new Date().toLocaleDateString(),

        },

      ],

    };

  });

}



/* ==========================================================
   UNSERVICEABLE
========================================================== */

export function UNSERVICEABLEItem(
  inventory,
  itemId
) {

  return inventory.map((item) => {

    if (item.id !== itemId) return item;

    return {

      ...item,

      status: "UNSERVICEABLE",

      history: [

        ...item.history,

        {

          action: "UNSERVICEABLE",

          date:
            new Date().toLocaleDateString(),

        },

      ],

    };

  });

}