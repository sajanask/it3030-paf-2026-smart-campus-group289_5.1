import { useState } from "react";
import { createBooking } from "../api/bookingApi";
import { useNavigate } from "react-router-dom";

const BookingForm = ({ onBookingCreated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    studentId: "",
    department: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch(name) {
      case 'resourceId':
        if (!value) return 'Resource ID is required';
        if (!/^[A-Z0-9-]{3,20}$/.test(value)) return 'Use format: CONF-101, LAB-202';
        return '';
      case 'studentId':
        if (!value) return 'Student ID is required';
        if (!/^\d{8,10}$/.test(value)) return 'Enter valid student ID (8-10 digits)';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Cannot book past dates';
        return '';
      case 'startTime':
        if (!value) return 'Start time is required';
        return '';
      case 'endTime':
        if (!value) return 'End time is required';
        if (form.startTime && value <= form.startTime) return 'End time must be after start time';
        return '';
      case 'purpose':
        if (!value) return 'Purpose is required';
        if (value.length < 10) return 'Please provide more detail (min 10 characters)';
        if (value.length > 500) return 'Purpose too long (max 500 characters)';
        return '';
      case 'department':
        if (!value) return 'Department is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const createdBooking = await createBooking(form);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      if (onBookingCreated) {
        onBookingCreated(createdBooking);
      }
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
    } catch (err) {
      alert("⚠️ Booking conflict or error! Please check availability.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = [
    "Computer Science",
    "Engineering",
    "Business Administration",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Psychology",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl animate-slide-in z-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <div>
            <div className="font-semibold">Booking Request Submitted!</div>
            <div className="text-sm opacity-90">Status: PENDING - Awaiting Approval</div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Redesigned University Header */}
        <div className="mb-8">
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Logo and Title */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                    <span className="text-3xl">🎓</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      SLIIT Resource Booking System
                    </h1>
                    <p className="text-blue-100 text-sm mt-1">
                      Faculty of Computing - Academic Resource Management
                    </p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">System Online</span>
                  </div>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <div className="flex gap-1 mt-5 border-t border-white/20 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/bookings")}
                  className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm font-medium backdrop-blur"
                >
                  📝 New Booking
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/my-bookings")}
                  className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                >
                  📋 My Bookings
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Workflow Status</p>
                <p className="text-sm font-semibold text-gray-700">PENDING → APPROVED/REJECTED</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Bookings Today</p>
                <p className="text-sm font-semibold text-gray-700">24 Resources Booked</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏛️</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Available Resources</p>
                <p className="text-sm font-semibold text-gray-700">8 Conference Rooms • 12 Labs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-white text-xl font-semibold">Resource Reservation Form</h2>
                <p className="text-blue-100 text-sm mt-1">Please fill in all required fields</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Student Information Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Student Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={form.studentId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 20240001"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          touched.studentId && errors.studentId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {touched.studentId && errors.studentId && (
                        <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          touched.department && errors.department ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {touched.department && errors.department && (
                        <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resource Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Resource Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="resourceId"
                      value={form.resourceId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="CONF-101, LAB-202, LIB-STUDY-1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        touched.resourceId && errors.resourceId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {touched.resourceId && errors.resourceId && (
                      <p className="text-red-500 text-xs mt-1">{errors.resourceId}</p>
                    )}
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Schedule Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          touched.date && errors.date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {touched.date && errors.date && (
                        <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          touched.startTime && errors.startTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {touched.startTime && errors.startTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={form.endTime}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                          touched.endTime && errors.endTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {touched.endTime && errors.endTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Booking Purpose
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purpose / Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows="3"
                      placeholder="Describe the purpose of this booking (e.g., Group project meeting, Research lab session, Thesis defense practice)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
                        touched.purpose && errors.purpose ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {touched.purpose && errors.purpose && (
                        <p className="text-red-500 text-xs">{errors.purpose}</p>
                      )}
                      <p className="text-gray-400 text-xs ml-auto">
                        {form.purpose.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transform hover:scale-[1.02] active:scale-100'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Submit Booking Request'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Information Panel */}
          <div className="space-y-6">
            {/* Booking Guidelines */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="font-semibold text-gray-800">Booking Guidelines</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Book at least 24 hours in advance
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Maximum 4 hours per booking
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Cancel 2 hours before if unable to attend
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">•</span>
                  Valid student ID required for verification
                </li>
              </ul>
            </div>

            {/* Available Resources */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏛️</span>
                <h3 className="font-semibold text-gray-800">Available Resources</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conference Rooms</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">8 Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Computer Labs</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">3 Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Study Rooms</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">12 Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auditorium</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Limited</span>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📞</span>
                <h3 className="font-semibold">Need Help?</h3>
              </div>
              <p className="text-sm text-blue-100 mb-3">
                Contact the Resource Management Office
              </p>
              <div className="space-y-2 text-sm">
                <div>📧 resources@university.edu</div>
                <div>📞 +1 (555) 123-4567</div>
                <div>🕒 Mon-Fri: 8:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 SLIIT University Resource Management System | All bookings are subject to university policies</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 0.6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BookingForm;
