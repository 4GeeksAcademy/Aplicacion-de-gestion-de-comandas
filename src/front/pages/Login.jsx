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

    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="row w-100" style={{ maxWidth: "900px" }}>
        {/* Imagen */}
        <div className="col-md-6 d-none d-md-block">
          #<img src="/workspaces/Aplicacion-de-gestion-de-comandas/public/img.jpg.png"
            
            className="img-fluid rounded"
            style={{ height: "100%", objectFit: "cover" }}
          />
        </div>

{/* Formulario */}
        <div className="col-md-6 d-flex align-items-start">
          <form onSubmit={handleLogin} className="w-100 p-4">
            <h2 className="text-start mb-4">Log in </h2>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-danger">Log in </button>
            <div className="mt-3 text-start">
              <span>¿Aún no tienes cuenta? </span>
              <div>
                <Link ClassName="text-red text-align-center" to="/register"> Sign up for an account</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

  )
}

export default Login
