import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; //para los mensajes modales de alerta 

// este componente es para REGISTRAR UN NUEVO USUARIO por primera vez en el aplicativo
const Register = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "danger"
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const Registrarse = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Las contraseñas no coinciden",
        text: "Verifica que ambas contraseñas sean iguales.",
        width: "200px",
        timer: 3000,
        customClass: {
          title: 'fs-5',
          popup: 'p-2',
          confirmButton: 'btn btn-danger btn-sm',

        },
      });
      return;
    }

    try {
      const res = await fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log(data)

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Usuario registrado con éxito!",
          confirmButtonText: "Iniciar sesión",
          width: "200px",
          timer: 3000,
          customClass: {
            title: 'fs-5',
            popup: 'p-2',
            confirmButton: 'btn btn-danger btn-sm',
          },
          
        }).then(() => {
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          navigate("/login");
        });

      } else {
        Swal.fire({
          icon: "error",
          title: "Error al registrar",
          text: data.msg || "No se pudo completar el registro.",
          width: "200px",
          timer: 3000,
          customClass: {
            title: 'fs-5',
            popup: 'p-3',
            confirmButton: 'btn btn-danger btn-sm',
          },
        });
      }

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "No se pudo conectar con el backend.",
        width: "200px",
      });
    }
  };


  return (
    <form onSubmit={Registrarse}
      className="container d-flex justify-content-center align-items-center vh-100">

      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h2>Registro</h2>
        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="Contraseña"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            placeholder="Repetir Contraseña"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
          />
        </div>

        <button type="submit">Registrar nuevo usuario</button>
        {message && (
          <div className={`alert alert-${messageType} mt-3`} role="alert">
            {message}
          </div>
        )}
      </div>
    </form>
  )
}

export default Register
