import { useEffect, useState } from "react";

const TableMap = () => {
  const [mesas, setMesas] = useState([]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await fetch(`${BASE_URL}/tables`);
        const data = await res.json();
        setMesas(data);
      } catch (err) {
        console.error("Error loading tables", err);
      }
    };

    fetchMesas();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Tables</h2>
      <div className="row g-4">
        {mesas.map((table) => (
          <div className="col-6 col-md-4 col-lg-3" key={table.id}>
            <div
              className="card h-100"
              style={{
                border: table.available ? "2px solid #28a745" : "2px solid #dc3545",
                backgroundColor: table.available ? "#e8f5e9" : "#f8d7da",
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
                <p className="card-text">
                  🪑 Seats: {table.seats}
                  <br />
                  {table.available ? (
                    <span className="text-success">✅ Available</span>
                  ) : (
                    <span className="text-danger">❌ Busy</span>
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