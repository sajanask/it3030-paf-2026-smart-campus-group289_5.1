import { useNavigate } from "react-router-dom";
import BookingList from "../components/BookingList";

const MyBookingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto mb-4 max-w-7xl rounded-3xl border border-white/40 bg-white/60 p-5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-medium shadow-md hover:shadow-lg hover:from-slate-800 hover:to-black transition-all duration-200 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <div className="w-[72px]" />
        </div>
      </div>
      <BookingList />
    </div>
  );
};

export default MyBookingsPage;
