import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; //para los mensajes modales de alerta
import Select from "react-select"; // para hacer un select de react para el rol


// este componente es para REGISTRAR UN NUEVO USUARIO por primera vez en el aplicativo
const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [rol, setRol] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "danger"
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const EstadoRol = [
    "camarero",
    "cocinero",
    "barman",
    "admin"
  ];

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
          title: "fs-5",
          popup: "p-2",
          confirmButton: "btn btn-danger btn-sm",
        },
      });
      return;
    }
    console.log(BASE_URL + "/register");
    try {
      const res = await fetch(BASE_URL + "/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, rol, password }),
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "¡User registered successfully!",
          confirmButtonText: "Log in",
          width: "200px",
          timer: 3000,
          customClass: {
            title: "fs-5",
            popup: "p-2",
            confirmButton: "btn btn-danger btn-sm",
          },
        }).then(() => {
          setEmail("");
          setName("");
          setRol("");
          setPassword("");
          setConfirmPassword("");
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Register Error",
          text: data.msg || "The registration could not be completed..",
          width: "200px",
          timer: 3000,
          customClass: {
            title: "fs-5",
            popup: "p-3",
            confirmButton: "btn btn-danger btn-sm",
          },
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "It was not possible to connect to the backend.",
        width: "200px",
      });
    }
  };

  const options = EstadoRol.map((rol) => ({
    value: rol,
    label: rol
  }));

  return (
    <form
      onSubmit={Registrarse}
      className="register-background d-flex align-items-start justify-content-start w-100 vh-100 p-4"
    >
      <div
        className="register-card w-100 p-4"
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
        <h2 className="mb-3 fw-bold">Create an Account🚀</h2>

        <div className="mb-2">
          <input
            className="form-control "
            style={{
              fontWeight: "bold",
            }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <input
            className="form-control "
            style={{
              fontWeight: "bold",
            }}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>


        <div className="mb-2">
          <Select
            className="form-control "
            options={options}
            value={options.find((o) => o.value === rol)}
            onChange={(selected) => setRol(selected.value)}
            placeholder="Select a role"
            styles={{
              control: (base) => ({
                ...base,
                background: "linear-gradient(to bottom, #e4a2b0, white)",
                color: "white",
                fontWeight: "bold",
                borderRadius: "8px",
                borderColor: "#ccc",
                boxShadow: "none",
                fontSize: "0.9rem"
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>




        <div className="mb-2">
          <input
            className="form-control "
            style={{
              fontWeight: "bold",
            }}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <input
            className="form-control "
            style={{
              fontWeight: "bold",
            }}
            type="password"
            placeholder="Repeat Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="register-button btn w-100"
          style={{
            background: "linear-gradient(to bottom, #e4a2b0, white)",
            color: "white",
            fontWeight: "bold",
            border: "none",

          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#e4a2b0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#e4a2b0")}
        >
          Register
        </button>

        {message && (
          <div className={`alert alert-${messageType} mt-3`} role="alert">
            {message}
          </div>
        )}
      </div>
    </form>
  );
};

export default Register;

{
  /* Imagen de este componente esta en css en la clase register-background*/
}
