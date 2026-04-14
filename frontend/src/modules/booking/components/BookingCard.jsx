import { useState } from "react";
import { approveBooking, rejectBooking } from "../api/bookingApi";

const BookingCard = ({ booking, isAdmin, refresh }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const statusColor =
    booking.status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : booking.status === "REJECTED"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  const isPending = booking.status === "PENDING";

  const handleAction = async (action) => {
    if (!booking.id || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      if (action === "approve") {
        await approveBooking(booking.id);
      } else {
        await rejectBooking(booking.id);
      }

      if (refresh) {
        await refresh();
      }
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || "Failed to update booking status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{booking.resourceId}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Date:</span> {booking.date}
        </p>
        <p>
          <span className="font-medium text-gray-700">Time:</span> {booking.startTime} - {booking.endTime}
        </p>
      </div>

      {isAdmin && (
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => handleAction("approve")}
            disabled={!isPending || actionLoading}
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {actionLoading ? "Updating..." : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => handleAction("reject")}
            disabled={!isPending || actionLoading}
            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Reject
          </button>
        </div>
      )}

      {isAdmin && !isPending && (
        <p className="mt-3 text-xs font-medium text-gray-500">
          This booking has already been {booking.status.toLowerCase()}.
        </p>
      )}

      {actionError && (
        <p className="mt-3 text-sm text-red-600">{actionError}</p>
      )}
    </div>
  );
};

export default BookingCard;
