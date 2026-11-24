import React from "react";
import AllFlightBooking from "./AllFlightBooking.jsx";

// Reuses the existing booking history UI. If/when hotel-specific API fields exist,
// this can be replaced with a dedicated hotel booking list component.
export default function HotelBookingHistory() {
  return <AllFlightBooking title="Hotel Booking History" buttonLabel="Hotels" defaultStatus="" />;
}

