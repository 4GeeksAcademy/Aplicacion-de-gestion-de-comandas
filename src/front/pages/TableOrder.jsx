import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import Menu from './Menu';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const TableOrder = () => {
  const [order, setOrder] = useState(null);
  const [table, setTable] = useState([]);
  const { id } = useParams(); //podemos extraer orderId de la URL
  const params = useParams();
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
      } else if (res.status === 404) {
        // Comanda no existe → Crear una nueva
        await createNewOrder();
      } else {
        console.error(data.msg);
      }
    } catch (err) {
      console.error("Error cargando la orden:", err);
    }
  };
  const createNewOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id'); // asegúrate de guardar el user_id al hacer login

      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mesa_id: parseInt(id),
          usuario_id: parseInt(userId),
          guest_notes: "",
          platos: []
        }),
      });

      const data = await res.json();
      console.log("Respuesta de comanda:", data)

      if (res.ok) {
        const order_ID = data.order_id;
        console.log("el ID de la comanda:", order_ID)

        navigate(`/table-order/${order_ID}`);
        setOrder({ ...data.result, platos: [] });

      } else {
        console.error("Error al crear comanda:", data.msg);
      }
    } catch (error) {
      console.error("Error al crear comanda:", error);
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
      })),
      guest_notes: order.guest_notes,
      date: order.date
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
        <h2 className='text-light'>Mesa🍽️#{order.mesa_id}</h2>
        <div className="d-flex gap-2">
          <label className="form-label text-light" style={{ fontWeight: 'bold' }}>
            {order.date}
          </label>
          <button
            className="table-order-btn on d-flex flex-column align-items-center justify-content-center text-decoration-none rounded"
            onClick={() => navigate("/tables")}
          >
            Ver Mesas
          </button>
          <button
            className="table-order-btn d-flex flex-column align-items-center justify-content-center text-decoration-none rounded"
            onClick={() => navigate(`/menu/${params.id}`)}
          >
            Añadir Platos
          </button>
        </div>
      </div>
      <ul className="table-order-card ">
        {order.platos.map((plato) => (
          <li key={plato.id} className="list-group-item d-flex justify-content-between align-items-center mb-2">
            <div>
              <strong className="fs-4">{plato.nombre_plato}</strong><br />
              Cantidad: {plato.cantidad} <br />
              Subtotal: €{plato.subtotal.toFixed(2)} <br />
              Estado: <span className="table-order-btn badge ">{plato.status_plate}</span>
            </div>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePlato(plato.plato_id)}>Eliminar</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleChangeCantidad(plato.plato_id, 'subtract')}>-</button>
              <button className="btn btn-sm btn-outline-success" onClick={() => handleChangeCantidad(plato.plato_id, 'add')}>+</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mb-3" style={{ position: "relative" }}>
        <label className=" form-label text-light fs-5">Notas de la comanda📋</label>
        <textarea
          className="table-order-note form-control pe-5 "
          style={{ color: '#2f2531', fontWeight: 'bold' }}
          rows="3"
          placeholder="Ej: Sin sal, alergia al gluten, etc."
          value={order.guest_notes || ""}
          onChange={(e) =>
            setOrder({ ...order, guest_notes: e.target.value })
          }
        />
        <button
          className="table-order-btn btn btn-sm btn-outline-success"
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            zIndex: 1,
            backgroundColor: "transparent",
            boxShadow: "none",
            outline: "none",
            color: "#198754", // Color verde Bootstrap
            borderColor: "#198754"
          }}
          onMouseDown={(e) => e.preventDefault()}  // elimina efecto visual
          onClick={() => updateOrderBackend(order.platos)}
        >
          Añadir
        </button>
      </div>
      <div className="mt-4 text-end text-light">
        <h4 btn btn-sm btn-outline-success>Total: €{totalPrice.toFixed(2)}</h4>
      </div>
    </div>
  );
};
export default TableOrder;