import React from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
 

  return (
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
  );
};

export default Admin;