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
        background: "linear-gradient(180deg, #f0f6ff, #ffffff)",
        height: "100vh",
        color: "#1b1b1b",
        fontFamily: "Inter, sans-serif",
        paddingTop: "20px",
      }}
    >
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
            background: "#ffffff",
            borderRadius: "18px",
            boxShadow: "0 4px 25px rgba(0,0,0,0.08)",
            overflow: "hidden",
            border: "1px solid #e1e7ff",
            height: "calc(100vh - 120px)",
          }}
        >
          {/* LEWA LISTA CZATÓW */}
          <div
            style={{
              width: "30%",
              background: "#f7faff",
              borderRight: "1px solid #dde7ff",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                color: "#007bff",
                textAlign: "center",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              💬 Twoje rozmowy
            </h3>

            {chats.length === 0 ? (
              <p style={{ textAlign: "center", color: "#8c99b2" }}>
                Brak rozmów.
              </p>
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
                        ? "rgba(0,123,255,0.12)"
                        : "rgba(255,255,255,0.7)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <img
                    src={chat.partner?.avatarUrl || defaultAvatar}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #007bff",
                    }}
                  />

                  <div style={{ flexGrow: 1 }}>
                    <b style={{ color: "#007bff" }}>
                      {chat.partner?.login}
                    </b>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "#5c6b82",
                      }}
                    >
                      {chat.offerTitle}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "#7d8da6",
                      }}
                    >
                      {chat.lastMessage.content.slice(0, 40)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PRAWA STRONA — LAYOUT MESSENGER */}
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {selectedChat ? (
              <>
                {/* HEADER */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid #e3e9ff",
                    padding: "16px",
                  }}
                >
                  <img
                    src={
                      selectedChat.partner?.avatarUrl || defaultAvatar
                    }
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #007bff",
                    }}
                  />
                  <div>
                    <h3 style={{ margin: 0, color: "#007bff" }}>
                      {selectedChat.partner?.login}
                    </h3>
                    <p style={{ margin: 0, color: "#5c6b82" }}>
                      {selectedChat.offerTitle}
                    </p>
                  </div>
                </div>

                {/* WIADOMOŚCI */}
                <div
                  style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    background: "#f7faff",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf:
                          msg.fromUser?.id === userId
                            ? "flex-end"
                            : "flex-start",
                        maxWidth: "75%",
                      }}
                    >
                      <div
                        style={{
                          background:
                            msg.fromUser?.id === userId
                              ? "linear-gradient(90deg, #007bff, #33b1ff)"
                              : "#eef4ff",
                          color:
                            msg.fromUser?.id === userId
                              ? "#fff"
                              : "#1b1b1b",
                          padding: "10px 14px",
                          borderRadius:
                            msg.fromUser?.id === userId
                              ? "16px 16px 0 16px"
                              : "16px 16px 16px 0",
                          boxShadow:
                            "0 2px 6px rgba(0,0,0,0.1)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#7d8da6",
                          marginTop: "4px",
                        }}
                      >
                        {new Date(
                          msg.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* INPUT */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    padding: "14px",
                    gap: "10px",
                    borderTop: "1px solid #dce6ff",
                    background: "#ffffff",
                  }}
                >
                  <input
                    value={newMsg}
                    onChange={(e) =>
                      setNewMsg(e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && sendMessage()
                    }
                    placeholder="Napisz wiadomość..."
                    style={{
                      flexGrow: 1,
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #c8d6ff",
                      background: "#f8faff",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    style={{
                      background: loading
                        ? "#9fcaff"
                        : "linear-gradient(90deg, #007bff, #33b1ff)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0 22px",
                      cursor: "pointer",
                      fontWeight: 600,
                      boxShadow:
                        "0 4px 10px rgba(0,123,255,0.3)",
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
                  color: "#8c99b2",
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
