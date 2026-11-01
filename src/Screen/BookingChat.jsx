
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import "./BookingChat.css";

function BookingChat() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [userId, setUserId] = useState("");
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let channel;

    const loadChat = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          navigate("/login");
          return;
        }

        setUserId(user.id);

        const { data: bookingData, error: bookingError } =
          await supabase
            .from("bookings")
            .select(`
              id,
              customer_id,
              status,
              services!inner (
                title,
                provider_id
              )
            `)
            .eq("id", bookingId)
            .single();

        if (bookingError) throw bookingError;

        const providerId = bookingData.services?.provider_id;
        const isParticipant =
          bookingData.customer_id === user.id ||
          providerId === user.id;

        if (!isParticipant) {
          throw new Error(
            "You do not have permission to access this conversation."
          );
        }

        setBooking(bookingData);

        const { data: messageData, error: messageError } =
          await supabase
            .from("booking_messages")
            .select("*")
            .eq("booking_id", bookingId)
            .order("created_at", { ascending: true });

        if (messageError) throw messageError;

        setMessages(messageData || []);

        channel = supabase
          .channel(`booking-chat-${bookingId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "booking_messages",
              filter: `booking_id=eq.${bookingId}`,
            },
            (payload) => {
              setMessages((current) => {
                const alreadyExists = current.some(
                  (item) => item.id === payload.new.id
                );

                return alreadyExists
                  ? current
                  : [...current, payload.new];
              });
            }
          )
          .subscribe();
      } catch (err) {
        setError(err.message || "Unable to open this conversation.");
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [bookingId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage || !userId || sending) return;

    setSending(true);
    setError("");

    try {
      const { data, error: sendError } = await supabase
        .from("booking_messages")
        .insert({
          booking_id: bookingId,
          sender_id: userId,
          message: cleanMessage,
        })
        .select()
        .single();

      if (sendError) throw sendError;

      setMessages((current) => {
        const alreadyExists = current.some(
          (item) => item.id === data.id
        );

        return alreadyExists ? current : [...current, data];
      });

      setMessageText("");
    } catch (err) {
      setError(err.message || "Your message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-chat-page">
        <p className="chat-loading">Loading conversation...</p>
      </div>
    );
  }

  return (
    <main className="booking-chat-page">
      <section className="booking-chat">
        <header className="chat-header">
          <button
            type="button"
            className="chat-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="chat-header-icon">
            <MessageCircle size={22} />
          </div>

          <div className="chat-header-info">
            <h1>Booking Conversation</h1>
            <p>
              {booking?.services?.title || "Service booking"}
              {" · "}
              {booking?.status || "Booking"}
            </p>
          </div>
        </header>

        {error && <p className="chat-error">{error}</p>}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <MessageCircle size={36} />
              <h2>Start the conversation</h2>
              <p>
                Send a message to discuss the service, booking, or
                any important details.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === userId;

              return (
                <div
                  key={message.id}
                  className={`chat-message-row ${
                    isMine ? "chat-message-mine" : "chat-message-theirs"
                  }`}
                >
                  <div className="chat-message-bubble">
                    <p>{message.message}</p>
                    <small>
                      {new Date(message.created_at).toLocaleString(
                        "en-NG",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </small>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-compose" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Write a message..."
            aria-label="Write a message"
            maxLength={5000}
            disabled={sending}
          />

          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            aria-label="Send message"
          >
            <Send size={19} />
            <span>{sending ? "Sending..." : "Send"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}

export default BookingChat;
