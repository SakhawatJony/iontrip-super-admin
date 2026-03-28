

import React from "react";
import Box from "@mui/material/Box";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./shared/Navbar.jsx";
import Footer from "./shared/Footer.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import AllDeposit from "./admin/AllDeposit.jsx";
import AllFlightBooking from "./admin/AllFlightBooking.jsx";
import AllAgent from "./admin/AllAgent.jsx";
import AllAdmin from "./admin/AllAdmin.jsx";
import AddAdmin from "./admin/AddAdmin.jsx";
import AllBank from "./admin/AllBank.jsx";
import LedgerReport from "./admin/LedgerReport.jsx";
import BookingQueDetails from "./admin/booingInfo/BookingQueDetails.jsx";
import BookingQueInvoice from "./admin/booingInfo/BookingQueInvoice.jsx";
import MakeTicketed from "./admin/booingInfo/MakeTicketed.jsx";
import AllBlog from "./admin/AllBlog.jsx";
import AddBlog from "./admin/AddBlog.jsx";
import ManageWebsite from "./admin/ManageWebsite.jsx";
import VisaLayout from "./admin/VisaLayout.jsx";
import AllVisa from "./admin/AllVisa.jsx";
import AddVisa from "./admin/AddVisa.jsx";
import TourLayout from "./admin/TourLayout.jsx";
import AllTour from "./admin/AllTour.jsx";
import AddTour from "./admin/AddTour.jsx";
import FlightLayout from "./admin/FlightLayout.jsx";
import FlightInfo from "./admin/FlightInfo.jsx";
import ReschedulePax from "./admin/ReschedulePax.jsx";
import AddFlightBooking from "./admin/AddFlightBooking.jsx";
import WalletOverview from "./admin/WalletOverview.jsx";
import AccountProfile from "./admin/AccountProfile.jsx";
import HotelLayout from "./admin/HotelLayout.jsx";
import HotelBookingHistory from "./admin/HotelBookingHistory.jsx";
import HotelConfirmHistory from "./admin/HotelConfirmHistory.jsx";
import HotelRefundHistory from "./admin/HotelRefundHistory.jsx";
import HotelCancelledHistory from "./admin/HotelCancelledHistory.jsx";

export default function App() {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/dashboard");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!hideChrome && <Navbar />}
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alldeposit" element={<AllDeposit />} />
            <Route path="flightbookings" element={<FlightLayout />}>
              <Route index element={<Navigate to="bookinghistory" replace />} />
              <Route
                path="bookinghistory"
                element={<AllFlightBooking title="All Booking" buttonLabel="All Booking" defaultStatus="" />}
              />
              <Route path="addflightbooking" element={<AddFlightBooking />} />
              <Route
                path="ticketedhistory"
                element={<AllFlightBooking title="Ticketed History" buttonLabel="Ticketed" defaultStatus="ticketed" />}
              />
              <Route
                path="cancelledhistory"
                element={<AllFlightBooking title="Cancelled History" buttonLabel="Cancelled" defaultStatus="cancelled" />}
              />
              <Route
                path="reissuehistory"
                element={<AllFlightBooking title="Reissue History" buttonLabel="Reissue" defaultStatus="reissue" />}
              />
              <Route
                path="refundshistory"
                element={<AllFlightBooking title="Refunds History" buttonLabel="Refunds" defaultStatus="refund" />}
              />
              <Route path="flightinfo" element={<FlightInfo />} />
              <Route path="reschedulepax" element={<ReschedulePax />} />
            </Route>
            <Route path="hotel" element={<HotelLayout />}>
              <Route index element={<Navigate to="bookinghistory" replace />} />
              <Route path="bookinghistory" element={<HotelBookingHistory />} />
              <Route path="confirmhistory" element={<HotelConfirmHistory />} />
              <Route path="refundshistory" element={<HotelRefundHistory />} />
              <Route path="cancelledhistory" element={<HotelCancelledHistory />} />
            </Route>
            <Route path="customer/allagent" element={<AllAgent />} />
            <Route path="settings/alladmin" element={<AllAdmin />} />
            <Route path="settings/addadmin" element={<AddAdmin />} />
            <Route path="settings/allbank" element={<AllBank />} />
            <Route path="ledgerreport" element={<LedgerReport />} />
            <Route path="wallet" element={<WalletOverview />} />
            <Route path="account" element={<AccountProfile title="Profile" />} />
            <Route path="account/alltraveler" element={<AccountProfile title="All Traveler" />} />
            <Route path="manage" element={<Navigate to="/dashboard/manage/allblog" replace />} />
            <Route path="manage/allblog" element={<AllBlog />} />
            <Route path="manage/website" element={<ManageWebsite />} />
            <Route path="addblog" element={<AddBlog />} />
            <Route path="editblog/:id" element={<AddBlog />} />
            <Route path="bookingqueuedetails" element={<BookingQueDetails />} />
            <Route path="bookingqueueinvoice" element={<BookingQueInvoice />} />
            <Route path="maketicketed" element={<MakeTicketed />} />

            <Route path="visa" element={<VisaLayout />}>
              <Route index element={<Navigate to="allvisa" replace />} />
              <Route path="allvisa" element={<AllVisa />} />
              <Route path="addvisa" element={<AddVisa />} />
            </Route>

            <Route path="tour" element={<TourLayout />}>
              <Route index element={<Navigate to="alltour" replace />} />
              <Route path="alltour" element={<AllTour />} />
              <Route path="addtour" element={<AddTour />} />
            </Route>
          </Route>
        </Routes>
      </Box>
      {!hideChrome && <Footer />}
    </Box>
  );
}
