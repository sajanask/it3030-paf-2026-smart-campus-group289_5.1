import axios from "axios";

const API = "http://localhost:8080/api/bookings";

// Create booking
export const createBooking = async (data) => {
  try {
    const res = await axios.post(API, data);
    return res.data;
  } catch (err) {
    // Handle conflict (400 or 409)
    if (err.response) {
      throw err.response.data?.message || "Booking failed!";
    } else {
      throw "Server not reachable!";
    }
  }
};

// Get all bookings
export const getBookings = async () => {
  try {
    const res = await axios.get(API);
    return res.data;
  } catch (err) {
    throw "Failed to fetch bookings!";
  }
};

// Check availability
export const checkAvailability = async (data) => {
  try {
    const res = await axios.post(`${API}/check-availability`, data);
    return res.data;
  } catch (err) {
    throw "Error checking availability!";
  }
};

// Approve booking
export const approveBooking = async (id) => {
  try {
    const res = await axios.put(`${API}/${id}/approve`);
    return res.data;
  } catch (err) {
    throw "Approve failed!";
  }
};

// Reject booking
export const rejectBooking = async (id) => {
  try {
    const res = await axios.put(`${API}/${id}/reject`);
    return res.data;
  } catch (err) {
    throw "Reject failed!";
  }
};