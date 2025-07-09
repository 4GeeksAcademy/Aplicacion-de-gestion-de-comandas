import { useEffect, useState } from "react";

const TableMap = () => {
  const [mesas, setMesas] = useState([]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/mesas`);
        const data = await res.json();
        setMesas(data);
      } catch (err) {
        console.error("Error al cargar las mesas", err);
      }
    };

    fetchMesas();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Mapa de Mesas</h2>
      <div className="row g-4">
        {mesas.map((mesa) => (
          <div className="col-6 col-md-4 col-lg-3" key={mesa.id}>
            <div
              className="card h-100"
              style={{
                border: mesa.available ? "2px solid #28a745" : "2px solid #dc3545",
                backgroundColor: mesa.available ? "#e8f5e9" : "#f8d7da",
              }}
            >
              <img
                src={mesa.image_url || "/default_table.jpg"}
                className="card-img-top"
                alt={`Mesa ${mesa.table_number}`}
                style={{ height: "150px", objectFit: "cover" }}
              />
              <div className="card-body text-center">
                <h5 className="card-title">Mesa {mesa.table_number}</h5>
                <p className="card-text">
                  🪑 Asientos: {mesa.seater}
                  <br />
                  {mesa.available ? (
                    <span className="text-success">✅ Disponible</span>
                  ) : (
                    <span className="text-danger">❌ Ocupada</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableMap;