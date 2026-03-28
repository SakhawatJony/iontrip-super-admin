import React from "react";
import AllFlightBooking from "./AllFlightBooking.jsx";

// Hotel "Confirm" page (wired to booking list UI using status filter).
export default function HotelConfirmHistory() {
  return <AllFlightBooking title="Confirm History" buttonLabel="Confirm" defaultStatus="confirmed" />;
}

