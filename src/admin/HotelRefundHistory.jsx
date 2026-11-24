import React from "react";
import AllFlightBooking from "./AllFlightBooking.jsx";

// Hotel refund history page (status-filtered booking list).
export default function HotelRefundHistory() {
  return <AllFlightBooking title="Refunds History" buttonLabel="Refunds" defaultStatus="refund" />;
}

