import BookingList from "../components/BookingList";

const AdminBookingPage = () => {
  return (
    <div>
      <h1>Admin Booking Management</h1>
      <BookingList isAdmin={true} />
    </div>
  );
};

export default AdminBookingPage;