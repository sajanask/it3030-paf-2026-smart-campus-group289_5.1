import { useEffect, useState } from "react";
import { getBookings } from "../api/bookingApi";
import BookingCard from "./BookingCard";

const BookingList = ({ isAdmin }) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const data = await getBookings();
    setBookings(data);
  };

  return (
    <div>
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} isAdmin={isAdmin} />
      ))}
    </div>
  );
};

export default BookingList;