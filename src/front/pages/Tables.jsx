import React, { useEffect } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Tables = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    //const token = localStorage.getItem("token");
    //console.log(token);
    //if (!token) {
    //  console.error("No hay token en localStorage");
    //  return;
    //}

    try {
      const res = await fetch(`${BASE_URL}/tables`, {
        headers: {
          "Content-Type": "application/json",
          //"Authorization": "Bearer " + token,
        },
      });

      if (!res.ok) throw new Error("Error al cargar mesas");

      const data = await res.json();
      console.log(data);
      dispatch({ type: "set_tables", payload: data.result });

    } catch (err) {
      console.error("Error trayendo las mesas:", err);
    }
  };


  const getStatusColor = (state) => {
    switch (state) {
      case 'available': return 'green';
      case 'busy': return 'yellow';
      case 'reserved': return 'gray';
      case 'closed': return 'brown';
      default: return 'white';
    }
  }

  return (
    <div className="container mt-5" 
    
    >
      <h1 className="mb-4 text-">Mesas del restaurante</h1>
      <div className="row">
        {store.tables?.length > 0 ? (
          store.tables.map((table) => (
            <div key={table.id} className="col-md-4 mb-3">
              <Link
                to={`/table-order/${table.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',

                }}
              >
                <div className="card p-3">
                  <h5>Mesa #{table.id}</h5>
                  <p>Asientos: {table.seats}</p>
                  <p>Estado: {table.state}</p>
                  <div className='rounded-circle me-2 position-absolute end-0'
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: getStatusColor(table.state),
                      display: 'flex ',
                    }}

                  ></div>

                </div>

              </Link>

            </div>
          ))
        ) : (
          <p>No hay mesas para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default Tables;
