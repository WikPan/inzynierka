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

  const defaultAvatar = "/default-avatar.png"; // 👈 wrzuć w /public lub /assets

  // 🔹 Pobierz ID zalogowanego użytkownika
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

  // 🔹 Pobierz wszystkie rozmowy użytkownika
  useEffect(() => {
    if (!userId) return;
    loadChats();
  }, [userId]);

  async function loadChats() {
    try {
      const res = await axios.get("http://localhost:3000/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Grupowanie wiadomości po ofercie i rozmówcy
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

      setChats(grouped);
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

    if (!toUserId) return;

    if (newMsg.trim().length === 0) return;

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
        height: "80vh",
        width: "90%",
        margin: "40px auto",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* 🔹 Lewy panel (lista rozmów) */}
      <div
        style={{
          width: "30%",
          borderRight: "1px solid #eee",
          overflowY: "auto",
          padding: "10px",
        }}
      >
        <h3 style={{ color: "#007bff", textAlign: "center" }}>💬 Twoje czaty</h3>

        {chats.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>Brak rozmów.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={`${chat.offerId}_${chat.partner?.id}`}
              onClick={() => loadMessages(chat)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderRadius: "8px",
                padding: "8px",
                marginBottom: "8px",
                backgroundColor:
                  selectedChat?.offerId === chat.offerId &&
                  selectedChat?.partner?.id === chat.partner?.id
                    ? "#e3f2fd"
                    : "#f9f9f9",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f0f8ff")
              }
              onMouseLeave={(e) => {
                if (
                  !(
                    selectedChat?.offerId === chat.offerId &&
                    selectedChat?.partner?.id === chat.partner?.id
                  )
                ) {
                  e.currentTarget.style.backgroundColor = "#f9f9f9";
                }
              }}
            >
              {/* 🖼️ Avatar rozmówcy */}
              <img
                src={chat.partner?.avatarUrl || defaultAvatar}
                alt="avatar"
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
              <div style={{ flexGrow: 1 }}>
                <b>{chat.partner?.login || "Nieznany użytkownik"}</b>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "0.85rem",
                    color: "#666",
                  }}
                >
                  {chat.offerTitle}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    color: "#999",
                  }}
                >
                  {chat.lastMessage.content.slice(0, 40)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔹 Prawy panel (czat) */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px",
        }}
      >
        {selectedChat ? (
          <>
            {/* 🧑 Nagłówek czatu z avatarem */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "10px",
              }}
            >
              <img
                src={selectedChat.partner?.avatarUrl || defaultAvatar}
                alt="avatar"
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
              <div>
                <h3 style={{ margin: 0, color: "#007bff" }}>
                  {selectedChat.partner?.login}
                </h3>
                <p style={{ margin: 0, color: "#666" }}>
                  {selectedChat.offerTitle}
                </p>
              </div>
            </div>

            {/* 📩 Wiadomości */}
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "15px",
                backgroundColor: "#fafafa",
              }}
            >
              {messages.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>
                  Brak wiadomości.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      textAlign: msg.fromUser?.id === userId ? "right" : "left",
                      margin: "6px 0",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor:
                          msg.fromUser?.id === userId ? "#007bff" : "#e9ecef",
                        color:
                          msg.fromUser?.id === userId ? "white" : "black",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        maxWidth: "70%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ✍️ Wysyłanie */}
            <div style={{ display: "flex" }}>
              <input
                type="text"
                placeholder="Napisz wiadomość..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
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
              color: "#999",
              margin: "auto",
              fontSize: "1.2rem",
            }}
          >
            👈 Wybierz rozmowę, aby zobaczyć wiadomości
          </p>
        )}
      </div>
    </div>
  );
}
