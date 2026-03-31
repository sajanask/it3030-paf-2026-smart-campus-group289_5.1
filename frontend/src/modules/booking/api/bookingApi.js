import axios from "axios";

const API = "http://localhost:8080/api/bookings";

export const createBooking = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};

export const getBookings = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const checkAvailability = async (data) => {
  const res = await axios.post(`${API}/check-availability`, data);
  return res.data;
};