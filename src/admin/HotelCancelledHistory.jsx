import React from "react";
import AllFlightBooking from "./AllFlightBooking.jsx";

// Hotel cancelled history page (status-filtered booking list).
export default function HotelCancelledHistory() {
  return <AllFlightBooking title="Cancelled History" buttonLabel="Cancelled" defaultStatus="cancelled" />;
}

