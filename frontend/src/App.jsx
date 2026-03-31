import { BrowserRouter, Routes, Route } from "react-router-dom";

import BookingPage from "./modules/booking/pages/BookingPage";
import MyBookingsPage from "./modules/booking/pages/MyBookingsPage";
import AdminBookingPage from "./modules/booking/pages/AdminBookingPage";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>   {/* ✅ ADD THIS */}
      <Routes>
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/admin/bookings" element={<AdminBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}