import { useEffect, useState } from "react";
import { getBookings } from "../api/bookingApi";
import BookingCard from "./BookingCard";

const BookingList = ({ isAdmin, refreshSignal, onBack }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [refreshSignal]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  className="group relative px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-gray-700 hover:text-purple-600 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <svg 
                    className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Back</span>
                </button>
              )}
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
                  Bookings
                </h2>
                <p className="text-gray-500 mt-1">
                  {!loading && `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchBookings}
              className="group relative px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-gray-600 hover:text-purple-600 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg 
                className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 bg-pink-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl p-6 mb-6 shadow-lg animate-shake">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Bookings</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchBookings}
              className="mt-4 ml-11 px-5 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 text-sm font-medium transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center transform transition-all duration-500 hover:scale-[1.02]">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-8 mb-6 animate-bounce-slow">
                <svg className="w-20 h-20 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                No Bookings Found
              </h3>
              <p className="text-gray-500 text-lg">It looks like you don't have any bookings yet.</p>
            </div>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => (
              <div
                key={booking.id}
                className="transform transition-all duration-500 hover:scale-[1.02] hover:rotate-1 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <BookingCard
                  booking={booking}
                  isAdmin={isAdmin}
                  refresh={fetchBookings}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #9333ea, #db2777);
        }
      `}</style>
    </div>
  );
};

export default BookingList;