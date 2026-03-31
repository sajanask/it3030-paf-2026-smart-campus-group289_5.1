const BookingCard = ({ booking, isAdmin }) => {
  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <p>Resource: {booking.resourceId}</p>
      <p>Date: {booking.date}</p>
      <p>{booking.startTime} - {booking.endTime}</p>
      <p>Status: {booking.status}</p>

      {isAdmin && (
        <>
          <button>Approve</button>
          <button>Reject</button>
        </>
      )}
    </div>
  );
};

export default BookingCard;