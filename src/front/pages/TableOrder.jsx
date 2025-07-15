import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      const data = await res.json();
      if (res.ok) {
        console.log(data.result.platos)
        const platosOrdenados = [...data.result.platos].sort((a, b) => a.id - b.id);
        setOrder({ ...data.result, platos: platosOrdenados });
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
    const nuevosPlatos = order.platos.map(plato => {
      if (plato.plato_id === platoId) {
        return { ...plato, cantidad: 0 }
      }
      return plato;
    });
    await updateOrderBackend(nuevosPlatos);
  };
  const updateOrderBackend = async (platosActualizados) => {
    const token = localStorage.getItem('token');
    const body = {
      platos: platosActualizados.map(p => ({
        plate_id: p.plato_id,
        cantidad: p.cantidad
      }))
    };
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      const platosOrdenados = [...data.result.platos].sort((a, b) => a.id - b.id);
      setOrder({ ...data.result, platos: platosOrdenados });
    } else {
      console.error(data.msg || data.error);
    }
  };
  if (!order) return <p className='text-center text-light mt-5'>Aún no hay ningún plato comandado!</p>;
  const totalPrice = order.platos.reduce((sum, plato) => sum + plato.subtotal, 0);
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className='text-light'>Mesa #{order.mesa_id}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary"
          onClick={() => navigate("/tables")}>
            Ver Mesas
          </button>
          <button className="btn btn-outline-primary"
          onClick={() => navigate("/menu")}
          >
            Añadir Platos
          </button>
        </div>
      </div>
      <ul className="list-group ">
        {order.platos.map((plato) => (
          <li key={plato.id} className="list-group-item d-flex justify-content-between align-items-center mb-2">
            <div>
              <strong>{plato.nombre_plato}</strong> <br />
              Cantidad: {plato.cantidad} <br />
              Subtotal: €{plato.subtotal.toFixed(2)} <br />
              Estado: <span className="badge bg-secondary">{plato.status_plate}</span>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePlato(plato.plato_id)}>Eliminar</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleChangeCantidad(plato.plato_id, 'subtract')}>-</button>
              <button className="btn btn-sm btn-outline-success" onClick={() => handleChangeCantidad(plato.plato_id, 'add')}>+</button>
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