import React from 'react';
import { useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_BACKEND_URL; // esta variable esta en .env

const Admin = () => {
  const navigate = useNavigate();

  const fetchOrders = async () => {
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "GET",
      credentials: "include", // si tu backend usa cookies/sesiones
      headers: {
        "Content-Type": "application/json",
        // Si usas JWT:
        // Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Respuesta con error:", data);
      throw new Error("Error en la petición de órdenes");
    }

    // Asegúrate de que `data.orders` existe antes de usar forEach
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach(order => {
        // tu lógica aquí
      });
    } else {
      console.warn("No orders available");
    }
  } catch (err) {
    console.error("Error loading orders:", err);
  }
};
 
  return (
    <>
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: "#000",  // fondo negro
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
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
            zIndex: 10,
          }}
        >
          <h3 className="text-center mb-2">Welcome to</h3>
          <h4 className="text-center mb-2">Hayashi Sushi Bar 🍣</h4>
          <p className="text-start mb-2">Admin View</p>

          <button
            type="button"
            onClick={() => navigate('/table-map')}
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
            Waiter View
          </button>

          <hr className="my-3" style={{ opacity: 0.4 }} />

          <button
            type="button"
            onClick={() => navigate('/orders-dashboard')}
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
            Cooker View
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Admin;