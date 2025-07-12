import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TableMap = () => {
  const [mesas, setMesas] = useState([]);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch(`${BASE_URL}/tables`); //hago get de todas las mesas
        const data = await res.json();
        setMesas(data.result);
        console.log(data.result);
      } catch (err) {
        console.error("Error loading tables", err);
      }
    };

    fetchMesas();
  }, []);

  const handleClick = (mesa) => {
    navigate("/table-order", { state: { mesa } });
  };

  return (
<div className="container py-4">
      <h2 className="mb-4">Tables</h2>
      <div className="row g-4">
        {mesas.map((table) => (
          <div className="col-6 col-md-4 col-lg-3" key={table.id}>
            <div
              className="card h-100"
              style={{
                border:
                  table.state === "available"
                    ? "2px solid #28a745"
                    : table.state === "busy"
                    ? "2px solid #dc3545"
                    : table.state === "reserved"
                    ? "2px solid #ffc107"
                    : "2px solid #6c757d",
                backgroundColor:
                  table.state === "available"
                    ? "#e8f5e9"
                    : table.state === "busy"
                    ? "#f8d7da"
                    : table.state === "reserved"
                    ? "#fff3cd"
                    : "#e2e3e5",
                cursor: "pointer",
              }}
              onClick={() => {
                if (table.state === "available" || table.state === "busy") {
                  navigate("/table-order", { state: { table } });
                } else {
                  alert("Mesa no disponible para ordenar.");
                }
              }}
            >
              <img
                src={table.image_url || "/default_table.jpg"}
                className="card-img-top"
                alt={`Mesa ${table.id}`}
                style={{ height: "150px", objectFit: "cover" }}
              />
              <div className="card-body text-center">
                <h5 className="card-title">Table {table.id}</h5>
                <div className="card-text">
                  🪑 Seats: {table.seats}
                  <br />
                  {table.state === "available" && (
                    <span className="text-success">✅ Available</span>
                  )}
                  {table.state === "busy" && (
                    <span className="text-danger">❌ Busy</span>
                  )}
                  {table.state === "reserved" && (
                    <span className="text-warning">⏳ Reserved</span>
                  )}
                  {table.state === "closed" && (
                    <span className="text-secondary">🔒 Closed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableMap;