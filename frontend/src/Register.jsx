import { useState } from "react";

export default function Register({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const register = async () => {
    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) return setMsg(data.detail || "Error");

    setMsg("Registered! You can login.");
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Register</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full"
      />

      <button onClick={register} className="bg-green-500 px-4 py-2">
        Register
      </button>

      <p>{msg}</p>

      <button onClick={onSwitch} className="underline text-sm">
        Go to Login
      </button>
    </div>
  );
}
