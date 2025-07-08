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
          title: "¡Usuario registrado con éxito!",
          confirmButtonText: "Iniciar sesión",
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
          title: "Error al registrar",
          text: data.msg || "No se pudo completar el registro.",
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
        title: "Error del servidor",
        text: "No se pudo conectar con el backend.",
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
        <h2 className="mb-3 fw-bold">Create an Account</h2>

        <div className="mb-2">
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <input
            className="form-control"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>


        <div className="mb-2">
          <Select
            options={options}
            value={options.find((o) => o.value === rol)}
            onChange={(selected) => setRol(selected.value)}
            placeholder="Select a role"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "rgba(255,255,255,0.6)",
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
            className="form-control"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <input
            className="form-control"
            type="password"
            placeholder="Repeat Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

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
