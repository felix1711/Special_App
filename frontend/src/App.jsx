// import { useEffect, useRef, useState } from "react";

// const USERNAME = "alice";
// const RECEIVER = "bob";

// export default function App() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [socketReady, setSocketReady] = useState(false);

//   const socketRef = useRef(null);
//   const bottomRef = useRef(null);

//   // ✅ Load history FIRST, then open WebSocket
//   useEffect(() => {
//     let ws;

//     const initChat = async () => {
//       // 1️⃣ Load chat history
//       const res = await fetch(
//         `http://localhost:8000/messages?user1=${USERNAME}&user2=${RECEIVER}`
//       );
//       const data = await res.json();

//       setMessages(
//         data.map(m => ({
//           from: m.sender,
//           text: m.message,
//           time: new Date(m.timestamp)
//         }))
//       );

//       // 2️⃣ Open WebSocket AFTER history is set
//       ws = new WebSocket("ws://127.0.0.1:8000/ws/alice");
//       socketRef.current = ws;

//       ws.onopen = () => {
//         console.log("✅ WS OPEN (UI)");
//         setSocketReady(true);
//       };

//       ws.onmessage = (e) => {
//         const data = JSON.parse(e.data);

//         setMessages(prev => [
//           ...prev,
//           {
//             from: data.from,
//             text: data.message,
//             time: new Date(data.timestamp)
//           }
//         ]);
//       };

//       ws.onerror = (e) => console.error("❌ WS ERROR", e);

//       ws.onclose = () => {
//         console.log("🔴 WS CLOSED (UI)");
//         setSocketReady(false);
//         socketRef.current = null;
//       };
//     };

//     initChat();

//     return () => {
//       if (ws) ws.close();
//     };
//   }, []);

//   // 3️⃣ Auto-scroll on new messages
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // 4️⃣ Send message (NO optimistic UI)
//   const sendMessage = () => {
//     if (!input.trim()) return;

//     if (
//       !socketRef.current ||
//       socketRef.current.readyState !== WebSocket.OPEN
//     ) {
//       console.log("❌ WebSocket not open yet");
//       return;
//     }

//     socketRef.current.send(
//       JSON.stringify({
//         to: RECEIVER,
//         message: input
//       })
//     );

//     setInput("");
//   };


//   return (
//     <div className="min-h-screen bg-[#0b141a] flex items-center justify-center">
//       <div className="w-full max-w-sm h-[95vh] bg-[#111b21] rounded-xl flex flex-col">

//         {/* Header */}
//         <div className="h-14 px-4 flex items-center gap-3 bg-[#202c33]">
//           <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center font-bold text-black">
//             B
//           </div>
//           <div>
//             <div className="text-sm font-semibold">Bob</div>
//             <div className="text-xs text-green-400">online</div>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2">
//           {messages.map((m, i) => {
//             const isMe = m.from === USERNAME;
//             return (
//               <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
//                 <div
//                   className={`px-3 py-2 max-w-[75%] rounded-2xl text-sm
//                   ${isMe ? "bg-[#005c4b] rounded-br-sm" : "bg-[#202c33] rounded-bl-sm"}`}
//                 >
//                   <div>{m.text}</div>
//                   <div className="text-[10px] text-gray-300 text-right mt-1">
//                     {m.time.toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit"
//                     })}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//           <div ref={bottomRef} />
//         </div>

//         {/* Input */}
//         <div className="h-14 px-3 flex items-center gap-2 bg-[#202c33]">
//           <input
//             value={input}
//             onChange={e => setInput(e.target.value)}
//             onKeyDown={e => e.key === "Enter" && sendMessage()}
//             placeholder="Type a message"
//             className="flex-1 h-10 px-4 rounded-full bg-[#2a3942] outline-none"
//           />
//           <button
//             onClick={sendMessage}
//             disabled={!socketReady}
//             className={`w-10 h-10 rounded-full font-bold
//               ${socketReady ? "bg-green-500 text-black" : "bg-gray-500 text-gray-300"}`}
//           >
//             ➤
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import ChristmasSplash from "./components/ChristmasSplash";
import Login from "./Login";
import Register from "./Register";
import Chat from "./Chat";

export default function App() {
  // 🎄 splash shown only once per app launch
  const [showSplash, setShowSplash] = useState(true);

  const [view, setView] = useState(
    localStorage.getItem("token") ? "chat" : "login"
  );

  // 🎄 1️⃣ SHOW SPLASH FIRST
  if (showSplash) {
    return <ChristmasSplash onFinish={() => setShowSplash(false)} />;
  }

  // 🔁 2️⃣ YOUR EXISTING FLOW (UNCHANGED)
  if (view === "register") {
    return <Register onSwitch={() => setView("login")} />;
  }

  if (view === "login") {
    return (
      <Login
        onLogin={() => setView("chat")}
        onSwitch={() => setView("register")}
      />
    );
  }

  return <Chat onLogout={() => setView("login")} />;
}
