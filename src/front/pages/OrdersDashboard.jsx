import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [plates, setPlates] = useState([]);
  const [users, setUsers] = useState({});
  const [filter, setFilter] = useState("all");
  const [openOrderIds, setOpenOrderIds] = useState([]);
  const [visibleNotes, setVisibleNotes] = useState([]);

  const navigate = useNavigate();
  //const API = import.meta.env.VITE_BACKEND_URL;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL; // esta variable esta en .env

  const filters = ["all", "completed", "rejected", "pending"];
  const categories = ["primer_plato", "segundo_plato", "postres", "bebidas"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rol = localStorage.getItem("rol");

    //if (!token || (rol !== "cocinero" && rol !== "admin")) {
     // navigate("/login");
    //}
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(BASE_URL + "/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.results || []);
        data.results.forEach((order) => {
          if (order.usuario_id && !users[order.usuario_id]) {
            fetch(`${API}api/users/${order.usuario_id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => res.json())
              .then((userData) => {
                setUsers((prev) => ({
                  ...prev,
                  [userData.result.id]: userData.result,
                }));
              })
              .catch((err) =>
                console.error("Error cargando usuario:", order.usuario_id, err)
              );
          }
        });
      })
      .catch((err) => console.error("Error cargando comandas:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(BASE_URL + "/plates", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPlates(data.results || []))
      .catch((err) => console.error("Error cargando platos:", err));
  }, []);

  const toggleNote = (orderId) => {
    setVisibleNotes((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleOrder = (id) => {
    setOpenOrderIds((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  };

  // para endpoint /orders/<order_id>/plate-status
  const updateItemStatus = (orderId, plateId, newStatus) => {
    const token = localStorage.getItem("token");

    fetch(`${BASE_URL}api/orders/${orderId}/plate-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        plate_id: plateId,
        status: newStatus,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setOrders((prev) =>
          prev.map((order) => {
            if (order.id !== orderId) return order;
            return {
              ...order,
              platos: order.platos.map((p) =>
                p.plato_id === plateId ? { ...p, status: newStatus } : p
              ),
            };
          })
        );
      })
      .catch((err) => console.error("Error actualizando plato:", err));
  };

  const confirmAllItems = (orderId) => {
    const token = localStorage.getItem("token");
    fetch(`${API}api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ state: "servida" }),
    }).then(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, state: "servida" } : o))
      );
    });
  };

  const resetOrderStatus = (orderId) => {
    const token = localStorage.getItem("token");
    fetch(`${API}api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ state: "pendiente" }),
    }).then(() => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, state: "pendiente" } : o))
      );
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    navigate("/login");
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders
        .map((order) => ({
          ...order,
          platos: order.platos.filter((p) => p.status === filter),
        }))
        .filter((order) => order.platos.length > 0);

  return (
    <div className="orders-dashboard">
      <div className="header">
        <div className="logo">
          <i className="fas fa-store"></i> <span>Japanese Restaurant</span>
        </div>

        <div className="filters modern-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-btn modern ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="user-panel">
          <button className="profile-btn" onClick={() => navigate("/profile")}>
            <i className="fas fa-circle-user"></i>
          </button>
          <button className="logout" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      <div className="order-list-header">
        <h3 className="order-list-title">Order list:</h3>
        <div className="orders-buttons">
          {orders.map((order) => (
            <button key={order.id} className={`order-button ${order.state}`}>
              #{order.id}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.map((order) => (
        <div
          key={order.id}
          className={`order-card ${openOrderIds.includes(order.id) ? "" : "closed"
            }`}
        >
          <div className="order-header" onClick={() => toggleOrder(order.id)}>
            <div>
              <div>
                Order #{order.id} - Table #{order.mesa_id}
                <button
                  className="comment-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNote(order.id);
                  }}
                >
                  <i className="fas fa-comment-dots"></i>
                </button>
              </div>
              <div className="order-meta">
                <i className="fas fa-clock"></i>{" "}
                {new Date(order.date).toLocaleString()} —{" "}
                <i className="fas fa-user-tie"></i>{" "}
                {users[order.usuario_id]?.name || `User #${order.usuario_id}`}
              </div>
              {visibleNotes.includes(order.id) && (
                <div className="order-note">
                  📝 <strong>Nota:</strong> {order.guest_notes}
                </div>
              )}
            </div>
          </div>

          <div className="order-content">
            {categories.map((cat) => {
              const items = order.platos.filter((p) => p.categoria === cat);
              if (items.length === 0) return null;

              return (
                <div key={cat} className="order-section">
                  <h4>{cat.replace("_", " ").toUpperCase()}</h4>
                  {items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span>{item.nombre_plato}</span>
                      <span className="qty">Qty: {item.cantidad}</span>
                      <div className="order-actions-bottom">
                        <button
                          className={`status-btn completed ${item.status === "completed" ? "selected" : ""
                            }`}
                          onClick={() =>
                            updateItemStatus(order.id, item.plato_id, "completed")
                          }
                        >
                          ✅ COMPLETED
                        </button>
                        <button
                          className={`status-btn rejected ${item.status === "rejected" ? "selected" : ""
                            }`}
                          onClick={() =>
                            updateItemStatus(order.id, item.plato_id, "rejected")
                          }
                        >
                          ❌ REJECTED
                        </button>
                        <button
                          className={`status-btn pending ${item.status === "pending" ? "selected" : ""
                            }`}
                          onClick={() =>
                            updateItemStatus(order.id, item.plato_id, "pending")
                          }
                        >
                          ⏳ PENDING
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="order-footer">
            <strong>Total: €{order.total_price.toFixed(2)}</strong>
            <button
              className="confirm-order-btn"
              onClick={() => confirmAllItems(order.id)}
            >
              <i className="fas fa-check-circle"></i> Confirm Order
            </button>
            <button
              className="reset-order-btn"
              onClick={() => resetOrderStatus(order.id)}
            >
              <i className="fas fa-undo-alt"></i> Reset
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersDashboard;

