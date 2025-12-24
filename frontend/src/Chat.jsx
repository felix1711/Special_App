// import { useEffect, useRef, useState } from "react";

// export default function Chat() {
//   const [allMessages, setAllMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [users, setUsers] = useState([]);
//   const [receiver, setReceiver] = useState(null);
//   const [me, setMe] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [typingUser, setTypingUser] = useState(null);
//   const pcRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const wsRef = useRef(null);

//   // 🔹 Decode username from JWT
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     setMe(payload.sub);
//   }, []);

//   // 🔹 Restore last opened chat after reload
// useEffect(() => {
//   if (!me) return;

//   const last = localStorage.getItem("lastChat");
//   if (last) {
//     setReceiver(last);
//   }
// }, [me]);


//   // 🔹 WebSocket connection (ONCE)
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
//     wsRef.current = ws;

//     ws.onmessage = e => {
//         const data = JSON.parse(e.data);

//         // 🟢 ONLINE / OFFLINE USERS
//         if (data.type === "online_users") {
//             setOnlineUsers(data.users);
//             return;
//         }

//         // ✍️ TYPING INDICATOR (optional for later)
//         if (data.type === "typing") {
//             setTypingUser(data.from);
//             setTimeout(() => setTypingUser(null), 1500);
//             return;
//         }

//         // 💬 NORMAL CHAT MESSAGE
//         setAllMessages(prev => {
//             const exists = prev.some(
//             m =>
//                 m.from === data.from &&
//                 m.to === data.to &&
//                 m.timestamp === data.timestamp
//             );
//             return exists ? prev : [...prev, data];
//         });
//     };


//     return () => ws.close();
//   }, []);

//   // 🔹 Fetch users (exclude self)
//   useEffect(() => {
//     if (!me) return;

//     fetch("http://127.0.0.1:8000/users")
//       .then(res => res.json())
//       .then(data => {
//         console.log("USERS FROM API:", data);
//         setUsers(data.filter(u => u.username !== me));
//       });
//   }, [me]);

//   // 🔹 Load history when receiver changes (MERGE, don’t replace)
//   useEffect(() => {
//     if (!receiver || !me) return;

//     fetch(
//       `http://127.0.0.1:8000/messages?user1=${me}&user2=${receiver}`
//     )
//       .then(res => res.json())
//       .then(data => {
//         setAllMessages(prev => {
//           const history = data.map(m => ({
//             from: m.sender,
//             to: m.receiver,
//             message: m.message,
//             timestamp: m.timestamp
//           }));

//           // merge + deduplicate
//           const merged = [...prev];
//           history.forEach(h => {
//             const exists = merged.some(
//               m =>
//                 m.from === h.from &&
//                 m.to === h.to &&
//                 m.timestamp === h.timestamp
//             );
//             if (!exists) merged.push(h);
//           });

//           return merged;
//         });
//       });
//   }, [receiver, me]);

//   useEffect(() => {
//     if (!receiver || !me) return;

//     fetch("http://127.0.0.1:8000/seen", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//         from: receiver,
//         to: me
//         })
//     });
// }, [receiver, me]);

// const pc = new RTCPeerConnection();

// const stream = await navigator.mediaDevices.getUserMedia({
//   audio: true,
//   video: isVideo
// });

// stream.getTracks().forEach(track => pc.addTrack(track, stream));

// pc.onicecandidate = e => {
//   if (e.candidate) {
//     wsRef.current.send(JSON.stringify({
//       type: "ice-candidate",
//       to: receiver,
//       candidate: e.candidate
//     }));
//   }
// };


//   // 🔹 Filter messages for active chat
//   const chatMessages = allMessages.filter(
//     m =>
//       receiver &&
//       ((m.from === me && m.to === receiver) ||
//         (m.from === receiver && m.to === me))
//   );

//   // 🔹 Auto-scroll to latest message
//     useEffect(() => {
//     const el = document.getElementById("chat-end");
//     el?.scrollIntoView({ behavior: "smooth" });
//     }, [chatMessages]);

//   const send = () => {
//     if (!receiver || !input.trim()) return;

//     wsRef.current.send(
//       JSON.stringify({
//         to: receiver,
//         message: input
//       })
//     );

//     setInput("");
//   };

// const formatIST = (timestamp) =>
//   new Date(timestamp).toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata"
//   });


//   return (
//     <div className="flex h-screen bg-[#f6f0ff]">

//         {/* LEFT SIDEBAR */}
//         <div className="w-64 bg-[#e9d8fd] p-4 flex flex-col">
//         <div className="font-bold text-purple-700 text-lg mb-4">
//             💜 People
//         </div>

//         <div className="flex-1 overflow-y-auto">
//             {users.map(u => (
//             <div
//                 key={u.username}
//                 onClick={() => {
//                 setReceiver(u.username);
//                 localStorage.setItem("lastChat", u.username);
//                 }}
//                 className={`p-2 mb-2 rounded-lg cursor-pointer
//                 ${
//                     receiver === u.username
//                     ? "bg-purple-500 text-white"
//                     : "hover:bg-purple-200 text-purple-800"
//                 }`}
//             >
//                 {u.username}
//             </div>
//             ))}
//         </div>

//         <button
//             onClick={() => {
//             localStorage.removeItem("token");
//             window.location.reload();
//             }}
//             className="mt-4 text-red-500 text-sm"
//         >
//             Logout
//         </button>
//         </div>

//         {/* RIGHT CHAT AREA */}
//         <div className="flex-1 flex flex-col">

//         {/* HEADER */}
//         <div className="bg-[#d8b4fe] px-4 py-3 shadow text-purple-900 font-semibold flex justify-between">
//             {receiver ? `Chat with 💕 ${receiver}` : "Select a chat"}
//             {receiver && (
//             <span className="text-sm">
//                 {onlineUsers.includes(receiver) ? "🟢 Online" : "⚪ Offline"}
//             </span>
//             )}
//             <div className="flex gap-3">
//             <button onClick={startAudioCall}>📞</button>
//             <button onClick={startVideoCall}>🎥</button>
//             </div>
//         </div>

//         {/* MESSAGES */}
//         <div className="flex-1 overflow-y-auto p-6 bg-purple-50">
//             {chatMessages.length === 0 && (
//                 <div className="text-center text-purple-400 mt-10">
//                 No messages yet 💭
//                 </div>
//             )}
//             {chatMessages.map((m, i) => {
//             const isMe = m.from === me;

//             const time =formatIST(m.timestamp);
//             return (
//                 <div
//                 key={i}
//                 className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}
//                 >
//                 <div
//                     className={`px-4 py-2 rounded-xl shadow
//                     ${isMe ? "bg-purple-600 text-white" : "bg-purple-200 text-purple-900"}
//                     w-auto max-w-md
//                     `}
//                 >
//                     {/* MESSAGE */}
//                     <div
//                       style={{
//                             backgroundColor: isMe ? "purple" : "white",
//                             color: isMe ? "white" : "black",
//                             padding: "12px 16px",
//                             borderRadius: "16px",
//                             maxWidth: "60%",
//                             boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
//                         }}
//                         >
//                         {m.message}
//                     </div>

//                     {/* TIME + TICKS */}
//                     <div className="flex justify-end items-center gap-1 mt-1 text-xs opacity-70">
//                     <span>{time}</span>

//                     {isMe && (
//                         <span className={m.seen ? "text-purple-900" : "text-purple-400"}>
//                         {m.seen ? "✓✓" : "✓"}
//                         </span>
//                     )}
//                     </div>
//                 </div>
//                 </div>
//             );
//         })}


//         <div id="chat-end" />
//         </div>
        

//         {/* TYPING */}
//         {typingUser && (
//             <div className="text-xs text-purple-600 px-4">
//             {typingUser} is typing...
//             </div>
//         )}

//         {/* INPUT */}
//         {receiver && (
//             <div className="p-4 bg-[#ede9fe] flex gap-2">
//             <input
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 className="flex-1 px-5 py-3 rounded-full bg-white border border-purple-200 shadow-sm outline-none"
//                 placeholder="Type something sweet 💌"
//             />
//             <button
//                 onClick={send}
//                 disabled={!input.trim()}
//                 className={`h-11 w-11 flex items-center justify-center
//                     rounded-full text-white text-lg shadow-lg transition
//                     ${
//                     input.trim()
//                         ? "bg-purple-500 hover:bg-purple-600 shadow-[0_0_12px_rgba(168,85,247,0.6)] active:scale-95"
//                         : "bg-purple-300 cursor-not-allowed"
//                     }`}
//                 >
//                 ➤
//             </button>
//             </div>
//         )}
//         </div>
//     </div>
//     );
// }

import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);


  const [typingUser, setTypingUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callType, setCallType] = useState(null); // audio | video

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setMe(payload.sub);
  }, []);

  /* ================= USERS ================= */
  useEffect(() => {
    if (!me) return;
    fetch("http://127.0.0.1:8000/users")
      .then(r => r.json())
      .then(data => setUsers(data.filter(u => u.username !== me)));
  }, [me]);

  /* ================= HISTORY ================= */
  useEffect(() => {
    if (!me || !receiver) return;

    fetch(`http://127.0.0.1:8000/messages?user1=${me}&user2=${receiver}`)
        .then(r => r.json())
        .then(data => {
        setMessages(prev => {
            const map = new Map();

            // existing (live WS messages)
            prev.forEach(m => map.set(String(m.timestamp), m));

            // DB messages
            data.forEach(m => {
            map.set(String(m.timestamp), {
                from: m.sender,
                to: m.receiver,
                message: m.message,
                timestamp: String(m.timestamp),
                seen: m.seen
            });
            });

            return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
        });
        });
 }, [me, receiver]);

    useEffect(() => {
        if (!me || !receiver || !wsRef.current) return;

        // 1️⃣ Update DB
        fetch("http://127.0.0.1:8000/seen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            from: receiver,
            to: me
            })
        });

        // 2️⃣ Notify sender LIVE via WS
        wsRef.current.send(JSON.stringify({
            type: "seen",
            viewer: me,        // who saw the messages
            sender: receiver   // original sender
        }));

    }, [receiver]);



    const getTicks = (msg) => {
        if (msg.from !== me) return null;

        if (!msg.seen) {
            return <span style={{ marginLeft: 6 }}>✔✔</span>; // delivered
        }

        return (
            <span style={{ marginLeft: 6, color: "#c084fc" }}>
            ✔✔
            </span>
        );
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        const msg = {
            from: me,
            to: receiver,
            message: input,
            timestamp: new Date().toISOString(),
            seen: false
        };

        // sender owns their message
        setMessages(prev => [...prev, msg]);

        wsRef.current.send(JSON.stringify(msg));
        setInput("");
    };



  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = async e => {
      const data = JSON.parse(e.data);
      
      if (data.type === "typing") {
        setTypingUser(data.from);
        setTimeout(() => setTypingUser(null), 1500);
        return;
      }

      if (data.type === "call-offer") {
        setIncomingCall(data);
        setCallType(data.callType);
        return;
      }

      if (data.type === "call-answer") {
        await pcRef.current.setRemoteDescription(data.answer);
        return;
      }

      if (data.type === "ice-candidate") {
        await pcRef.current.addIceCandidate(data.candidate);
        return;
      }

      if (data.type === "online_users") {
        setOnlineUsers(data.users);
        return;
        }

      // ✅ SEEN EVENT
      if (data.type === "seen") {
        setMessages(prev =>
            prev.map(m =>
            m.from === me &&
            m.to === data.viewer &&
            !m.seen
                ? { ...m, seen: true }
                : m
            )
        );
        return;
      }

      if (data.message && data.from !== me) {
        setMessages(prev => {
            const exists = prev.some(
            m =>
                m.from === data.from &&
                m.to === data.to &&
                m.timestamp === String(data.timestamp)
            );

            if (exists) return prev;

            return [
            ...prev,
            {
                from: data.from,
                to: data.to,
                message: data.message,
                timestamp: String(data.timestamp),
                seen: data.seen ?? false
            }
            ];
        });
    }


     console.log("WS EVENT:", data);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, receiver]);


  /* ================= HELPERS ================= */
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
 };


  const chatMessages = messages.filter(
    m =>
      receiver &&
      ((m.from === me && m.to === receiver) ||
        (m.from === receiver && m.to === me))
  );

  /* ================= CHAT ================= */
//   const send = () => {
//     if (!receiver || !input.trim()) return;
//     wsRef.current.send(JSON.stringify({ to: receiver, message: input }));
//     setInput("");
//   };

  const sendTyping = () => {
    wsRef.current.send(JSON.stringify({ type: "typing", to: receiver }));
  };

  /* ================= WEBRTC ================= */
  const createPC = () => {
    pcRef.current = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    });


    pcRef.current.onicecandidate = e => {
      if (e.candidate) {
        wsRef.current.send(
          JSON.stringify({
            type: "ice-candidate",
            to: receiver,
            candidate: e.candidate
          })
        );
      }
    };

    pcRef.current.ontrack = e => {
      remoteVideoRef.current.srcObject = e.streams[0];
      remoteVideoRef.current.style.display = "block";
    };
  };

  const startCall = async type => {
    setCallType(type);
    createPC();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video"
    });

    if (type === "video") {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.style.display = "block";
    }

    stream.getTracks().forEach(t => pcRef.current.addTrack(t, stream));

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    wsRef.current.send(
      JSON.stringify({
        type: "call-offer",
        to: receiver,
        offer,
        callType: type
      })
    );
  };

  const acceptCall = async () => {
    const data = incomingCall;
    setIncomingCall(null);

    createPC();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video"
    });

    if (callType === "video") {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.style.display = "block";
    }

    stream.getTracks().forEach(t => pcRef.current.addTrack(t, stream));

    await pcRef.current.setRemoteDescription(data.offer);
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    wsRef.current.send(
      JSON.stringify({
        type: "call-answer",
        to: data.from,
        answer
      })
    );
  };

  const endCall = () => {
    pcRef.current?.close();
    pcRef.current = null;

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      localVideoRef.current.srcObject = null;
      localVideoRef.current.style.display = "none";
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.style.display = "none";
    }

    setIncomingCall(null);
    setCallType(null);

  };

  const handleLogout = () => {
  // close websocket
  if (wsRef.current) {
    wsRef.current.close();
  }

  // remove auth token
  localStorage.removeItem("token");

  // hard reload to reset all state safely
  window.location.reload();
};


  /* ================= UI ================= */
  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-purple-100">

      {/* USERS */}
    <div className="w-64 bg-gradient-to-b from-purple-100 to-purple-200 p-4 border-r border-purple-300">
    <h3 className="font-semibold text-purple-800 mb-4 tracking-wide">
        People
    </h3>

    {users.map(u => {
        const isActive = receiver === u.username;
        const isOnline = onlineUsers.includes(u.username);

        return (
        <div
            key={u.username}
            onClick={() => setReceiver(u.username)}
            className={`
            flex items-center justify-between
            p-3 mb-2 rounded-lg cursor-pointer
            transition-all duration-150
            ${isActive
                ? "bg-purple-600 text-white shadow"
                : "bg-white hover:bg-purple-200"}
            `}
        >
            <span className="font-medium">{u.username}</span>

            {/* online dot */}
            <span
            className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
            />
        </div>
        );
    })}
    </div>


      {/* CHAT */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-3 bg-white border-b border-purple-200 flex justify-between items-center">
            <div className="flex flex-col">
                <span className="font-semibold text-lg text-gray-800">
                    {receiver || "Select a chat"}
                </span>

                {receiver && (
                    <span className="flex items-center gap-1 text-xs">
                        <span
                        className={`h-2 w-2 rounded-full ${
                            onlineUsers.includes(receiver)
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                        />
                        <span
                        className={
                            onlineUsers.includes(receiver)
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                        >
                        {onlineUsers.includes(receiver) ? "Online" : "Offline"}
                        </span>
                    </span>
                )}

            </div>

            <div className="flex gap-3 text-xl items-center">
                {receiver && (
                    <>
                    <button
                        className="hover:scale-110 transition"
                        onClick={() => startCall("audio")}
                    >
                        📞
                    </button>

                    <button
                        className="hover:scale-110 transition"
                        onClick={() => startCall("video")}
                    >
                        🎥
                    </button>

                    <button
                        className="hover:scale-110 transition"
                        onClick={endCall}
                    >
                        ❌
                    </button>
                    </>
                )}

                {/* 🚪 LOGOUT */}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="ml-3 text-lg hover:scale-110 transition"
                >
                    ⏻
                </button>
                </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {chatMessages.map((m, i) => {
            const isMe = m.from === me;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    background: isMe ? "#7c3aed" : "#fff",
                    color: isMe ? "#fff" : "#000",
                    padding: "10px 14px",
                    borderRadius: 16,
                    maxWidth: "60%"
                  }}
                >
                  {m.message}
                  <div
                    style={{
                        fontSize: 10,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 4
                    }}
                    >
                    <span>{formatTime(m.timestamp)}</span>
                    {getTicks(m)}
                  </div>
                </div>
              </div>
            );
          })}

           {/* 👇 AUTO SCROLL TARGET */}
        <div ref={messagesEndRef} />
  
          {typingUser && (
            <div className="text-xs text-gray-500">{typingUser} typing…</div>
          )}
        </div>

        {receiver && (
          <div className="p-3 bg-[#ede9fe] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={sendTyping}
              className="flex-1 p-2 rounded"
              placeholder="Type a message"
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        )}
      </div>

      {/* INCOMING CALL */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-5 rounded">
            <p>Incoming {callType} call from {incomingCall.from}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={acceptCall}>Accept</button>
              <button onClick={endCall}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO */}
      <video ref={remoteVideoRef} autoPlay playsInline style={{ display: "none" }} />
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          display: "none",
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 140,
          borderRadius: 10
        }}
      />
    </div>
  );
}
