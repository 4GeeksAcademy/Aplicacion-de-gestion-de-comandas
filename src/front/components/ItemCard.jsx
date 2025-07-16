import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function ItemCard({ item }) {

  const params = useParams();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');

  if (!item) return null;

  const handleAddItemOrder = async () => {
    if (!token) {
      setMessage('Error: orderId not disponible');
      setMessageType('error');
      return;
    }

    const payload = {
      platos: [
        {
          plate_id: item.id,
          cantidad: 1,
        },
      ],
    };

    try {
      const response = await fetch(`${BASE_URL}/orders/${params.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Producto añadido a la comanda correctamente!');
        setMessageType('success');
        if (onOrderUpdated) {
          onOrderUpdated(data.result);
        }
      } else {
        setMessage(`Error al añadir producto: ${data.msg || 'Error desconocido'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error de red: ${error.message}`);
      setMessageType('error');
    }

    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="product-card-menuview">

      <div>
        <h3 className="product-name-menuview d-flex flex-column justify-content-between">{item.name}</h3>
      </div>

      <div>
        <p className="product-description-menuview d-flex flex-column justify-content-between">{item.description}</p>
      </div>

      <div className='d-flex justify-content-between align-items-center'>
        <p className="product-price-menuview mb-0">{item.price} €</p>
        <button
          style={{ backgroundColor: '#e4a2b0', fontWeight: 'bold' }}
          type="button"
          className="btn"
          onClick={handleAddItemOrder}
        >
          Add
        </button>
      </div>

    </div>

  );
}

export default ItemCard;