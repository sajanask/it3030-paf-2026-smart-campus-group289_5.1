import { BrowserRouter, Routes, Route } from "react-router-dom";

import BookingPage from "./modules/booking/pages/BookingPage";
import MyBookingsPage from "./modules/booking/pages/MyBookingsPage";
import AdminBookingPage from "./modules/booking/pages/AdminBookingPage";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="app-background" aria-hidden="true">
          <span className="app-orb app-orb-one" />
          <span className="app-orb app-orb-two" />
          <span className="app-orb app-orb-three" />
          <span className="app-grid" />
          <span className="app-glow" />
        </div>

        <div className="app-content">
          <Routes>
            <Route path="/bookings" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
