import React from 'react'

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'; // <-- Importar SweetAlert2
import useGlobalReducer from "../hooks/useGlobalReducer"; //sin llaves pues se exporto useGlobalReducer

const Login = () => {
  const navigate = useNavigate();
  //  const { store, dispatch } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL; // esta variable esta en .env

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token); //guardo el token y el usuario en localStorage
        localStorage.setItem("user", data.user);
        // ✅ Mostrar modal de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Login exitoso!',
          text: 'Usted se ha logueado correctamente',
          confirmButtonText: 'Continuar',
          width: "200px",
          timer: 3000,
          customClass: {
            title: 'fs-5',
            popup: 'p-2',
            confirmButton: 'btn btn-danger btn-sm',
          },

        }).then(() => {
          navigate("/private"); // Re-dirige después de cerrar el modal a la pagin /private o la principal. decidiremos el nombre 
        });
      } else {
        // ❌ Mostrar modal de error
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: data.msg || 'Credenciales incorrectas',
          width: "200px",
          timer: 3000,
          customClass: {
            title: 'fs-5',
            popup: 'p-2',
            confirmButton: 'btn btn-danger btn-sm',
          },
        });
      }
    } catch (err) {
      console.error("ERROR DE FETCH:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error del servidor',
        text: 'No se pudo conectar con el servidor',
        width: "200px",
        timer: 3000,
        customClass: {
          title: 'fs-5',
          popup: 'p-2',
          confirmButton: 'btn btn-danger btn-sm',
        },
      });
    }
  };

  return (

    <form
      onSubmit={handleLogin}
      className="login-background d-flex align-items-start justify-content-start w-70 vh-100 p-4"
    >



      <div
        className="w-100 p-4"
        style={{
          maxWidth: "320px",
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          borderRadius: "16px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(4px)", // Efecto glass suave
          width: "100%",

          zIndex: 10,
        }}
      >
        <h3 className="text-center mb-2">Welcome to  </h3>
        <h4 className="text-center mb-2"> Hayashi Sushi Bar 🍣</h4>
        <p className="text-start mb-2"> Log in </p>

        <div className="mb-2">
          <input
            className="form-control"
            type="email"
            placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>

        <div className="mb-2">
          <input
            className="form-control"
            type="password"
            placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)} required
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
            fontWeight: "500",
            transition: "background-color 0.3s"
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#e76b60")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#fa8072")}
        >
          Log in
        </button>
        <div className="mt-3 text-start">
          <span>¿Dont you have an account yet? </span>
          <div>
            <Link className="text-decoration-none" to="/register"> Sign up for an account</Link>
          </div>
        </div>

        <hr className="my-3" style={{ opacity: 0.4 }} />

        {/* Olvidaste tu contraseña */}
        <div>
          <Link className="text-decoration-none " to="/reset-password">
            Forgot your password?
          </Link>
        </div>
      </div>

    </form>

  )
}

export default Login
