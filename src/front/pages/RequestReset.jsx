import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";



export default function RequestReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleRequestResetPass = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(BASE_URL+"/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMsg(data.message || data.error);
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(BASE_URL+`/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    console.log("Respuesta del backend:", data);

    setMsg(data.message || data.error);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{token ? "Restablecer contraseña" : "Recuperar contraseña"}</h2>

      <form onSubmit={token ? handleResetPassword : handleRequestResetPass}>
        {!token ? (
          <>
            <label>Correo electrónico:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
          </>
        ) : (
          <>
            <label>Nueva contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : token ? "Cambiar contraseña" : "Enviar enlace"}
          
        </button>
      </form>

      {msg && <p style={{ marginTop: "1rem" }}>{msg}</p>}
    </div>
  );
}