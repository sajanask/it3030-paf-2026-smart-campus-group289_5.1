import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, getBookings } from "../api/bookingApi";
import { getResources } from "../api/resourceApi";

const departments = [
  "Computer Science",
  "Engineering",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Other"
];

const typeStyles = {
  All: "bg-slate-100 text-slate-700",
  Lab: "bg-sky-100 text-sky-700",
  Hall: "bg-emerald-100 text-emerald-700",
  Auditorium: "bg-amber-100 text-amber-700"
};

const statusStyles = {
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700"
};

const BookingForm = ({ onBookingCreated }) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    studentId: "",
    department: ""
  });

  useEffect(() => {
    if (!showSuccess) {
      return undefined;
    }

    const timer = window.setTimeout(() => setShowSuccess(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (resources.length > 0) {
      fetchBookings();
    }
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesType =
        selectedType === "All" || resource.type === selectedType;
      const matchesSearch =
        !searchTerm ||
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [resources, searchTerm, selectedType]);

  const bookingCounts = useMemo(() => {
    return {
      total: myBookings.length,
      pending: myBookings.filter((booking) => booking.status === "PENDING").length,
      approved: myBookings.filter((booking) => booking.status === "APPROVED").length
    };
  }, [myBookings]);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError("");

      const data = await getBookings();
      const normalizedBookings = (Array.isArray(data) ? data : []).map((booking) => {
        const matchedResource = resources.find(
          (resource) => resource.id === booking.resourceId
        );

        return {
          ...booking,
          resourceName: matchedResource?.name || "Unknown Resource"
        };
      });

      setMyBookings(normalizedBookings);
    } catch (error) {
      setBookingsError("Failed to load booking data from the database.");
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      setResourcesError("");
      const data = await getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      setResourcesError("Failed to load resources from the database.");
    } finally {
      setResourcesLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "resourceId":
        return value ? "" : "Please select a lab, hall, or auditorium.";
      case "studentId":
        if (!value) return "Student ID is required.";
        return /^\d{8,10}$/.test(value)
          ? ""
          : "Student ID must contain 8 to 10 digits.";
      case "department":
        return value ? "" : "Please select your department.";
      case "date":
        if (!value) return "Booking date is required.";
        if (value < new Date().toISOString().split("T")[0]) {
          return "Past dates cannot be booked.";
        }
        return "";
      case "startTime":
        return value ? "" : "Start time is required.";
      case "endTime":
        if (!value) return "End time is required.";
        if (form.startTime && value <= form.startTime) {
          return "End time must be after start time.";
        }
        return "";
      case "purpose":
        if (!value.trim()) return "Please enter the booking purpose.";
        return value.trim().length >= 10
          ? ""
          : "Purpose should be at least 10 characters.";
      default:
        return "";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const nextErrors = {};

    Object.entries(form).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        nextErrors[key] = error;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleResourceSelect = (resource) => {
    if (resource.status !== "Available") {
      return;
    }

    setSelectedResource(resource);
    setForm((current) => ({ ...current, resourceId: resource.id }));
    setTouched((current) => ({ ...current, resourceId: true }));
    setErrors((current) => ({ ...current, resourceId: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setTouched({
      resourceId: true,
      date: true,
      startTime: true,
      endTime: true,
      purpose: true,
      studentId: true,
      department: true
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdBooking = await createBooking(form);

      const newBooking = {
        id: createdBooking?.id || `BK-${Date.now()}`,
        resourceName: selectedResource?.name || form.resourceId,
        resourceId: form.resourceId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        status: createdBooking?.status || "PENDING"
      };

      setMyBookings((current) => [newBooking, ...current]);
      setShowSuccess(true);

      if (onBookingCreated) {
        onBookingCreated(createdBooking);
      }

      await fetchBookings();

      setForm({
        resourceId: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        studentId: "",
        department: ""
      });
      setTouched({});
      setErrors({});
      setSelectedResource(null);
    } catch (error) {
      window.alert(error?.message || error || "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {showSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">
            Booking request submitted successfully. It has been added to your My Booking section.
          </div>
        )}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-900 to-cyan-800 shadow-xl">
          <div className="flex flex-col gap-5 px-6 py-6 text-white lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">
                Smart Campus Booking
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Book Labs, Halls, and Auditoriums
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
                Select a place from the cards below, choose your date and time, and submit the booking request.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowMyBookings((current) => !current)}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                My Booking ({bookingCounts.total})
              </button>
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View All Bookings
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/10 bg-white/5 px-6 py-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Resources</p>
              <p className="mt-1 text-2xl font-semibold">
                {resourcesLoading ? "..." : resources.length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Approved</p>
              <p className="mt-1 text-2xl font-semibold">{bookingCounts.approved}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-cyan-100">Pending</p>
              <p className="mt-1 text-2xl font-semibold">{bookingCounts.pending}</p>
            </div>
          </div>
        </section>

        {showMyBookings && (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">My Booking Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest booking requests are shown here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMyBookings(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            {bookingsError && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {bookingsError}
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {bookingsLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  Loading booking details...
                </div>
              )}

              {!bookingsLoading && myBookings.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No bookings available yet. Select a resource below and create one.
                </div>
              )}

              {!bookingsLoading && myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {booking.resourceName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.purpose || "No purpose provided."}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[booking.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Date: {booking.date}</p>
                    <p>Time: {booking.startTime} - {booking.endTime}</p>
                    <p className="sm:col-span-2">Purpose: {booking.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Choose a Resource</h2>
              <p className="mt-1 text-sm text-slate-500">
                Students can select a lab, hall, or auditorium from these cards.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, ID, or location"
                className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-72"
              />
              <div className="flex flex-wrap gap-2">
                {["All", "Lab", "Hall", "Auditorium"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedType === type
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {resourcesError && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {resourcesError}
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {!resourcesLoading && filteredResources.map((resource) => {
              const isSelected = selectedResource?.id === resource.id;
              const isAvailable = resource.status === "Available";

              return (
                <button
                  key={resource.id}
                  type="button"
                  onClick={() => handleResourceSelect(resource)}
                  disabled={!isAvailable}
                  className={`rounded-3xl border p-5 text-left transition ${
                    isSelected
                      ? "border-sky-500 bg-sky-50 shadow-md"
                      : isAvailable
                      ? "border-slate-200 bg-white hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          typeStyles[resource.type]
                        }`}
                      >
                        {resource.type}
                      </span>
                      <h3 className="mt-3 text-xl font-semibold text-slate-900">
                        {resource.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{resource.location}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {resource.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {resource.description}
                  </p>

                  <div className="mt-5 grid gap-2 text-sm text-slate-600">
                    <p>Location: {resource.location}</p>
                    <p>Capacity: {resource.capacity} students</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 text-sm font-semibold text-sky-700">
                    {isSelected
                      ? "Selected for booking"
                      : isAvailable
                      ? "Select this resource"
                      : "Currently unavailable"}
                  </div>
                </button>
              );
            })}
          </div>

          {resourcesLoading && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              Loading resources...
            </div>
          )}

          {!resourcesLoading && filteredResources.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No resources match your search.
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Booking Form</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill the details after selecting your lab, hall, or auditorium.
                </p>
              </div>

              {selectedResource && (
                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                  <p className="font-semibold">{selectedResource.name}</p>
                  <p>{selectedResource.type} | {selectedResource.location}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="20240001"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {touched.studentId && errors.studentId && (
                    <p className="mt-1 text-sm text-rose-600">{errors.studentId}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Department
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  {touched.department && errors.department && (
                    <p className="mt-1 text-sm text-rose-600">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {touched.date && errors.date && (
                    <p className="mt-1 text-sm text-rose-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Selected Resource
                  </label>
                  <input
                    type="text"
                    value={selectedResource ? selectedResource.name : ""}
                    readOnly
                    placeholder="Select a card above"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
                  />
                  {touched.resourceId && errors.resourceId && (
                    <p className="mt-1 text-sm text-rose-600">{errors.resourceId}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {touched.startTime && errors.startTime && (
                    <p className="mt-1 text-sm text-rose-600">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                  {touched.endTime && errors.endTime && (
                    <p className="mt-1 text-sm text-rose-600">{errors.endTime}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Purpose
                </label>
                <textarea
                  name="purpose"
                  rows="4"
                  value={form.purpose}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Example: Database practical session for second-year students"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
                <div className="mt-1 flex items-center justify-between">
                  {touched.purpose && errors.purpose ? (
                    <p className="text-sm text-rose-600">{errors.purpose}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-slate-400">{form.purpose.length}/500</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                  isSubmitting
                    ? "cursor-not-allowed bg-slate-400"
                    : "bg-slate-900 hover:bg-sky-700"
                }`}
              >
                {isSubmitting ? "Submitting Booking..." : "Submit Booking"}
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Selected Space</h3>
              {!selectedResource ? (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Select one resource card first. The chosen lab, hall, or auditorium will appear here.
                </p>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p className="text-lg font-semibold text-slate-900">{selectedResource.name}</p>
                  <p>{selectedResource.type}</p>
                  <p>{selectedResource.location}</p>
                  <p>Capacity: {selectedResource.capacity}</p>
                  <p>{selectedResource.description}</p>
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Booking Notes</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>Choose a card first so the booking is linked to the correct place.</p>
                <p>Use the My Booking button in the header to quickly view submitted booking details.</p>
                <p>Enter a clear purpose so the request can be reviewed more easily.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
