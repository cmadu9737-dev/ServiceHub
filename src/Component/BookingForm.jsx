
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Send } from "lucide-react";
import { supabase } from "../supabaseClient";

function BookingForm({ serviceId }) {
  const navigate = useNavigate();

  const [bookingDate, setBookingDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!bookingDate) {
      setError("Please select a booking date.");
      return;
    }

    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Please select today or a future date.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          customer_id: user.id,
          service_id: serviceId,
          booking_date: bookingDate,
          message: message.trim(),
          status: "pending",
        },
      ]);

    setLoading(false);

    if (bookingError) {
      setError(bookingError.message);
      return;
    }

    setSuccess("Your booking request has been sent successfully!");
    setBookingDate("");
    setMessage("");
  };

  return (
    <form className="booking-form" onSubmit={handleBooking}>
      <h3>Book This Service</h3>
      <p>Choose your preferred date and send a booking request.</p>

      <label htmlFor="booking-date">Preferred Booking Date</label>
      <div className="booking-date-field">
        <CalendarDays size={18} />
        <input
          id="booking-date"
          type="date"
          value={bookingDate}
          min={new Date().toLocaleDateString("en-CA")}
          onChange={(e) => setBookingDate(e.target.value)}
          required
        />
      </div>

      <label htmlFor="booking-message">Message to Provider</label>
      <textarea
        id="booking-message"
        rows="4"
        placeholder="Describe what you need or add any useful details..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {error && <p className="booking-error">{error}</p>}
      {success && <p className="booking-success">{success}</p>}

      <button type="submit" disabled={loading}>
        <Send size={17} />
        {loading ? "Sending Request..." : "Send Booking Request"}
      </button>
    </form>
  );
}

export default BookingForm;
