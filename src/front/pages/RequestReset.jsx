import { useState } from "react";


const RequestReset=()=> {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(BASE_URL+"/request-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error:", res.status, errorText);
        setMessage("No se pudo enviar el correo. Intenta nuevamente.");
        return;
      }

      const data = await res.json();
      setMessage(data.message || "Correo enviado correctamente");
      console.log(data.message)
    } catch (err) {
      console.error(err);
      setMessage("Error del servidor");
    }
  };

  return (
    <div>
      <h2>Recuperar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar enlace</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default  RequestReset;