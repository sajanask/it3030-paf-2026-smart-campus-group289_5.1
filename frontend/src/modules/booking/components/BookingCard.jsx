const BookingCard = ({ booking, isAdmin }) => {
  const statusColor =
    booking.status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : booking.status === "REJECTED"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

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
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
