import React from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Respuesta con error:", data);
        throw new Error("Error en la petición de órdenes");
      }

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
    <div
      className="d-flex justify-content-center align-items-center flex-grow-1"
      style={{
        backgroundColor: "#000",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="admin-background d-flex justify-content-center align-items-center w-100 h-100">
        <div
          className="card-admin p-4"
          style={{
            maxWidth: "320px",
            width: "90%",
            minWidth: "260px",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: "16px",
            backdropFilter: "blur(4px)",
            zIndex: 10,
          }}
        >
          <h3 className="text-center mb-2 text-light">Welcome to</h3>
          <h4 className="text-center mb-2" style={{ color: "#e4a2b0" }}>
            Hayashi Sushi Bar 🍣
          </h4>
          <p className="text-start mb-2" style={{ color: "white" }}>
            Admin View
          </p>

          <button
            type="button"
            onClick={() => navigate('/tables')}
            className="btn w-100 mb-2"
            style={{
              backgroundColor: "#e4a2b0",
              color: "#2f2531",
              fontWeight: "bold",
              border: "none",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#e4a2b0")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#e4a2b0")}
          >
            Waiter View
          </button>

          <hr className="my-3" style={{ opacity: 0.4 }} />

          <button
            type="button"
            onClick={() => navigate('/orders-dashboard')}
            className="btn w-100"
            style={{
              backgroundColor: "#e4a2b0",
              color: "#2f2531",
              fontWeight: "bold",
              border: "none",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#e4a2b0")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#e4a2b0")}
          >
            Cooker View
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
