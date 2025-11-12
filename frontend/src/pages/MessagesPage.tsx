import { useEffect, useState } from "react";
import axios from "axios";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  fromUser?: { id: string; login: string; avatarUrl?: string };
  toUser?: { id: string; login: string; avatarUrl?: string };
  offer?: { id: string; title: string };
};

export default function MessagesPage() {
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultAvatar = "/default-avatar.png";

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:3000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserId(res.data.id))
        .catch(() => setUserId(null));
    }
  }, [token]);

  useEffect(() => {
    if (!userId) return;
    loadChats();
  }, [userId]);

  async function loadChats() {
    try {
      const res = await axios.get("http://localhost:3000/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const grouped = Object.values(
        res.data.reduce((acc: any, msg: any) => {
          const offerId = msg.offer?.id;
          const partner =
            msg.fromUser?.id === userId ? msg.toUser : msg.fromUser;
          const key = `${offerId}_${partner?.id}`;

          if (!acc[key]) {
            acc[key] = {
              offerId,
              offerTitle: msg.offer?.title || "Nieznana oferta",
              partner,
              lastMessage: msg,
            };
          } else if (
            new Date(msg.createdAt) >
            new Date(acc[key].lastMessage.createdAt)
          ) {
            acc[key].lastMessage = msg;
          }
          return acc;
        }, {})
      );

      const sorted = (grouped as any[]).sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );

      setChats(sorted);
    } catch (err) {
      console.error("Błąd pobierania czatów:", err);
    }
  }

  async function loadMessages(chat: any) {
    setSelectedChat(chat);
    try {
      const res = await axios.get(
        `http://localhost:3000/messages/offer/${chat.offerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Błąd pobierania wiadomości:", err);
    }
  }

  async function sendMessage() {
    if (!token || !userId || !selectedChat) return;

    const toUserId =
      selectedChat.partner?.id === userId
        ? selectedChat.lastMessage.fromUser.id
        : selectedChat.partner.id;

    if (!toUserId || newMsg.trim().length === 0) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/messages",
        {
          fromUserId: userId,
          toUserId,
          offerId: selectedChat.offerId,
          content: newMsg,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (err) {
      console.error("Błąd wysyłania:", err);
    } finally {
      setLoading(false);
    }
  }

 return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(180deg, #0d1117, #161b22)",
      minHeight: "100vh",
      color: "#e6edf3",
      fontFamily: "Inter, sans-serif",
    }}
  >
    {/* Cały obszar czatu */}
    <div
      style={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1300px",
          display: "flex",
          background: "rgba(13,17,23,0.85)",
          borderRadius: "18px",
          boxShadow: "0 0 25px rgba(0,0,0,0.4)",
          overflow: "hidden",
          border: "1px solid rgba(88,166,255,0.1)",
          backdropFilter: "blur(12px)",
          minHeight: "calc(100vh - 100px)", // zajmuje prawie całą przestrzeń pod navem
        }}
      >
        {/* Lewy panel — lista rozmów */}
        <div
          style={{
            width: "30%",
            background: "rgba(22,27,34,0.85)",
            borderRight: "1px solid rgba(88,166,255,0.1)",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              color: "#58a6ff",
              textAlign: "center",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            💬 Twoje rozmowy
          </h3>

          {chats.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ba1b0" }}>Brak rozmów.</p>
          ) : (
            chats.map((chat) => (
              <div
                key={`${chat.offerId}_${chat.partner?.id}`}
                onClick={() => loadMessages(chat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  background:
                    selectedChat?.offerId === chat.offerId &&
                    selectedChat?.partner?.id === chat.partner?.id
                      ? "rgba(56,139,253,0.15)"
                      : "rgba(255,255,255,0.03)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(56,139,253,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    selectedChat?.offerId === chat.offerId &&
                    selectedChat?.partner?.id === chat.partner?.id
                      ? "rgba(56,139,253,0.15)"
                      : "rgba(255,255,255,0.03)")
                }
              >
                <img
                  src={chat.partner?.avatarUrl || defaultAvatar}
                  alt="avatar"
                  onError={(e) => (e.currentTarget.src = defaultAvatar)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #58a6ff",
                  }}
                />
                <div style={{ flexGrow: 1 }}>
                  <b style={{ color: "#58a6ff" }}>
                    {chat.partner?.login || "Nieznany użytkownik"}
                  </b>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#c9d1d9" }}>
                    {chat.offerTitle}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#8b949e" }}>
                    {chat.lastMessage.content.slice(0, 40)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Prawa sekcja — czat */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "25px",
            background: "rgba(10,13,18,0.8)",
            overflow: "hidden",
          }}
        >
          {selectedChat ? (
            <>
              {/* Nagłówek */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  borderBottom: "1px solid rgba(88,166,255,0.15)",
                  paddingBottom: "12px",
                  marginBottom: "15px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={selectedChat.partner?.avatarUrl || defaultAvatar}
                  alt="avatar"
                  onError={(e) => (e.currentTarget.src = defaultAvatar)}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #58a6ff",
                  }}
                />
                <div>
                  <h3 style={{ margin: 0, color: "#58a6ff" }}>
                    {selectedChat.partner?.login}
                  </h3>
                  <p style={{ margin: 0, color: "#8b949e" }}>
                    {selectedChat.offerTitle}
                  </p>
                </div>
              </div>

              {/* Wiadomości */}
              <div
                style={{
                  flexGrow: 1,
                  overflowY: "auto",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                {messages.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#8b949e" }}>
                    Brak wiadomości.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf:
                          msg.fromUser?.id === userId
                            ? "flex-end"
                            : "flex-start",
                        maxWidth: "70%",
                      }}
                    >
                      <div
                        style={{
                          background:
                            msg.fromUser?.id === userId
                              ? "linear-gradient(90deg, #238636, #2ea043)"
                              : "rgba(255,255,255,0.05)",
                          color:
                            msg.fromUser?.id === userId ? "#fff" : "#e6edf3",
                          padding: "10px 14px",
                          borderRadius:
                            msg.fromUser?.id === userId
                              ? "16px 16px 0 16px"
                              : "16px 16px 16px 0",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                          wordBreak: "break-word",
                          fontSize: "0.95rem",
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#6e7681",
                          marginTop: "4px",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pole wysyłania */}
              <div
                style={{
                  display: "flex",
                  marginTop: "15px",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  placeholder="💭 Napisz wiadomość..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  style={{
                    flexGrow: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(88,166,255,0.3)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#e6edf3",
                    outline: "none",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  style={{
                    background: loading
                      ? "rgba(88,166,255,0.4)"
                      : "linear-gradient(90deg, #58a6ff, #00bfff)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0 22px",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 10px rgba(56,139,253,0.3)",
                  }}
                >
                  {loading ? "..." : "Wyślij"}
                </button>
              </div>
            </>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#8b949e",
                margin: "auto",
                fontSize: "1.2rem",
              }}
            >
              👉 Wybierz rozmowę, aby rozpocząć czat
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);
}