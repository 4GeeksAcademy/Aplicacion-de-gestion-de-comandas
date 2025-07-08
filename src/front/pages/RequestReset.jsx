import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";


const RequestReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(BASE_URL + "/api/request-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error:", res.status, errorText);
        setMessage("Usuario no encontrado. Intente nuevamente.");
        setSuccess(false);
        return;
      }

      const data = await res.json();
      setMessage(data.msg || "Correo enviado correctamente, revise su bandeja de entrada de correo");
      setSuccess(true);
      console.log(data.msg);
      console.log("token generado:", data.token)
      setEmail("");

    } catch (err) {
      console.error(err);
      setMessage("Server Error");
      setSuccess(false);
    }
  };

  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => {
      setMessage(null);
      setSuccess(false);
    }, 10000); // 10000 ms = 10 segundos

    return () => clearTimeout(timer); // Limpia si el componente se desmonta o el mensaje cambia
  }
}, [message]);


  return (
    <form
      onSubmit={handleSubmit}
      className="register-background d-flex align-items-start justify-content-start w-100 vh-100 p-4"
    >

      <div
        className="w-100 p-4"
        style={{
          maxWidth: "320px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(4px)", // Efecto glass suave
          width: "100%",
          zIndex: 1, // Asegura que quede por encima del filtro del fondo
          position: "relative",

        }}
      >
        <h2>Recuperar contraseña</h2>
        <div className="mb-2">
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          
          <button
                    type="submit"
                    className="btn w-100"
                    style={{
                        backgroundColor: "#fa8072",
                        color: "white",
                        fontWeight: "bold",
                        border: "none",
                        transition: "background-color 0.3s"
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#e76b60")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#fa8072")}
                >
                  Send link
                </button>
        </div>

 {message && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: success ? "#d4edda" : "#f8d7da",
              color: success ? "#155724" : "#721c24",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
 {message}
            {success && (
              <div style={{ marginTop: "8px" }}>
               
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#155724",
                    textDecoration: "underline",
                    fontSize: "0.9rem",
                  }}
                >
                  Ir a Gmail
                </a>
              </div>
            )}
            </div>
        )}
       
      </div>
    </form>


  );
};

export default RequestReset;