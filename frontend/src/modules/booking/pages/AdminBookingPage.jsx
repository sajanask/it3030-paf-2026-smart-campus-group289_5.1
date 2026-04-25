import { useState } from "react";
import BookingList from "../components/BookingList";
import AdminResourceManager from "../components/AdminResourceManager";

const AdminBookingPage = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-800 px-6 py-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold">Admin Booking Management</h1>
          <p className="mt-2 text-sm text-slate-200">
            Manage booking approvals and campus resources from one place.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "bookings"
                  ? "bg-white text-slate-900"
                  : "border border-white/30 text-white hover:bg-white/10"
              }`}
            >
              Booking Requests
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resources")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === "resources"
                  ? "bg-white text-slate-900"
                  : "border border-white/30 text-white hover:bg-white/10"
              }`}
            >
              Manage Resources
            </button>
          </div>
        </section>

        {activeTab === "bookings" ? (
          <BookingList isAdmin={true} />
        ) : (
          <AdminResourceManager />
        )}
      </div>
    </div>
  );
};

export default AdminBookingPage;
