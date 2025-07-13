import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const TableOrder = () => {
  const [order, setOrder] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    fetchOrder();
  }, []);
  const fetchOrder = async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${id}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.result);
      } else {
        console.error(data.msg);
      }
    } catch (err) {
      console.log("ERROR AL CARGAR LA ORDEN")
      console.error("Error cargando la orden:", err);
    }
  };
  const handleChangeCantidad = async (platoId, accion) => {
    // Clonamos los platos
    let nuevosPlatos = [...order.platos];
    nuevosPlatos = nuevosPlatos.map(plato => {
      if (plato.plato_id === platoId) {
        const nuevaCantidad =
          accion === "add" ? plato.cantidad + 1 :
            accion === "subtract" ? Math.max(plato.cantidad - 1, 1) :
              plato.cantidad;
        return { ...plato, cantidad: nuevaCantidad };
      }
      return plato;
    });
    await updateOrderBackend(nuevosPlatos);
  };
  const handleDeletePlato = async (platoId) => {
  const nuevosPlatos = order.platos
    .filter(plato => plato.plato_id !== platoId);
  await updateOrderBackend(nuevosPlatos);
};
  const updateOrderBackend = async (platosActualizados) => {
    const body = {
      platos: platosActualizados.map(p => ({
        plate_id: p.plato_id,
        cantidad: p.cantidad
      }))
    };
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      setOrder(data.result); // actualizas el estado local
    } else {
      console.error(data.msg || data.error);
    }
  };
  if (!order) return <p className='text-center mt-5'>Cargando orden...</p>;
  const totalPrice = order.platos.reduce((sum, plato) => sum + plato.subtotal, 0);
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className='text-light'>Mesa #{order.mesa_id}</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate("/tables")}
        >
          Ver Mesas
        </button>
      </div>
      <ul className="list-group">
        {order.platos.map((plato) => (
          <li key={plato.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{plato.nombre_plato}</strong> <br />
              Cantidad: {plato.cantidad} <br />
              Subtotal: €{plato.subtotal.toFixed(2)} <br />
              Estado: <span className="badge bg-secondary">{plato.status_plate}</span>
            </div>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePlato(plato.plato_id)}>Eliminar</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=> handleChangeCantidad(plato.plato_id, 'subtract')}>-</button>
              <button className="btn btn-sm btn-outline-success" onClick={()=> handleChangeCantidad(plato.plato_id, 'add')}>+</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-end">
        <h4 className='text-light'>Total: €{totalPrice.toFixed(2)}</h4>
      </div>
    </div>
  );
};
export default TableOrder;