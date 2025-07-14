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
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const filters = ["all", "completed", "rejected", "pending"];
    const categories = ["starters", "main_dishes", "desserts", "drinks"];

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${BASE_URL}/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const ordenes = Array.isArray(data) ? data : data.results;
                if (!Array.isArray(ordenes)) return;
                setOrders(ordenes);

                ordenes.forEach((order) => {
                    if (order.usuario_id && !users[order.usuario_id]) {
                        fetch(`${BASE_URL}users/${order.usuario_id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        })
                            .then((res) => res.json())
                            .then((userData) => {
                                if (userData.result) {
                                    setUsers((prev) => ({
                                        ...prev,
                                        [userData.result.id]: userData.result,
                                    }));
                                }
                            })
                            .catch((err) =>
                                console.error("Error cargando usuario:", order.usuario_id, err)
                            );
                    }
                });
            })
            .catch((err) => {
                console.error("Error cargando comandas:", err);
                alert("No se pudieron cargar las comandas. Verifica el token o conexión.");
            });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${BASE_URL}/plates`, {
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
            prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
        );
    };

    const toggleOrder = (id) => {
        setOpenOrderIds((prev) =>
            prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
        );
    };

    const updateItemStatus = (orderId, plateId, newStatus) => {
        const token = localStorage.getItem("token");

        fetch(`${BASE_URL}/orders/${orderId}/plate-status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                plate_id: plateId,
                status_plate: newStatus,
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
                                p.plato_id === plateId ? { ...p, status_plate: newStatus } : p
                            ),
                        };
                    })
                );
            })
            .catch((err) => console.error("Error actualizando plato:", err));
    };

    const confirmAllItems = (orderId) => {
        const token = localStorage.getItem("token");
        fetch(`${BASE_URL}/orders/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ state: "ready" }),
        }).then(() => {
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId
                        ? {
                            ...o,
                            state: "ready",
                            platos: o.platos.map((p) => ({ ...p, status_plate: "completed" })),
                        }
                        : o
                )
            );
        });
    };

    const resetOrderStatus = (orderId) => {
        const token = localStorage.getItem("token");
        fetch(`${BASE_URL}/orders/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ state: "pendiente" }),
        }).then(() => {
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId
                        ? {
                            ...o,
                            state: "pendiente",
                            platos: o.platos.map((p) => ({ ...p, status_plate: "pending" })),
                        }
                        : o
                )
            );
        });
    };

    const filteredOrders =
        filter === "all"
            ? orders
            : orders
                .map((order) => ({
                    ...order,
                    platos: Array.isArray(order.platos)
                        ? order.platos.filter((p) => {
                            if (filter === "none") return !p.status_plate;
                            return p.status_plate === filter;
                        })
                        : [],
                }))
                .filter((order) => order.platos.length > 0);

    return (
        <div className="orders-dashboard container-fluid">
            <div className="header row align-items-center">
                <div className="filters modern-filters col-md-12 d-flex justify-content-center mb-3">
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
            </div>

            <div className="order-list-header">
                <h3 className="order-list-title">Order list:</h3>
                <div className="orders-buttons">
                    {orders.map((order) => (
                        <button
                            key={order.id}
                            className={`order-button ${order.state}`}
                            onClick={() => toggleOrder(order.id)}
                        >
                            #{order.id}
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <p style={{ textAlign: "center", marginTop: "2rem" }}>
                    ⚠️ No hay órdenes para mostrar con este filtro.
                </p>
            ) : (
                filteredOrders.map((order) => (
                    <div
                        key={order.id}
                        className={`order-card ${openOrderIds.includes(order.id) ? "" : "closed"}`}
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
                                    {order.date && !isNaN(Date.parse(order.date))
                                        ? new Date(order.date).toLocaleString("es-ES", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                        })
                                        : "Fecha no disponible"}{" "}
                                    — <i className="fas fa-user-tie"></i>{" "}
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
                                const items = (order.platos || []).filter(
                                    (p) =>
                                        p.category &&
                                        p.category.toLowerCase() === cat.toLowerCase()
                                );

                                if (!items.length) return null;

                                return (
                                    <div key={cat} className="order-section">
                                        <h4>{cat.replace("_", " ").toUpperCase()}</h4>
                                        {items.map((item) => (
                                            <div
                                                key={item.plato_id}
                                                className="order-item"
                                            >
                                                <span>{item.nombre_plato}</span>
                                                <span className="qty">
                                                    Qty: {item.cantidad}
                                                </span>
                                                <div className="order-actions-bottom">
                                                    <button
                                                        className={`status-btn completed ${item.status_plate === "completed"
                                                                ? "selected"
                                                                : ""
                                                            }`}
                                                        onClick={() =>
                                                            updateItemStatus(
                                                                order.id,
                                                                item.plato_id,
                                                                "completed"
                                                            )
                                                        }
                                                    >
                                                        ✅ COMPLETED
                                                    </button>
                                                    <button
                                                        className={`status-btn rejected ${item.status_plate === "rejected"
                                                                ? "selected"
                                                                : ""
                                                            }`}
                                                        onClick={() =>
                                                            updateItemStatus(
                                                                order.id,
                                                                item.plato_id,
                                                                "rejected"
                                                            )
                                                        }
                                                    >
                                                        ❌ REJECTED
                                                    </button>
                                                    <button
                                                        className={`status-btn pending ${item.status_plate === "pending"
                                                                ? "selected"
                                                                : ""
                                                            }`}
                                                        onClick={() =>
                                                            updateItemStatus(
                                                                order.id,
                                                                item.plato_id,
                                                                "pending"
                                                            )
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
                ))
            )}
        </div>
    );
};

export default OrdersDashboard;

