import React, { useEffect, useState } from "react";

const Private = () => {
  const [message, setMessage] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL; // importo la variable q esta en .env

  useEffect(() => {
    getPrivateData();
  }, []);


  const getPrivateData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(BASE_URL + "/private", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setMessage(data.msg);
      } else {
        setMessage("Acceso denegado");
      }
    } catch (err) {
      setMessage("Error al acceder al área privada");
    }
  };


  return (
    <div className="private-background  d-flex align-items-start justify-content-start w-70 vh-100 p-4">
     
     
    </div>
  );
};
export default Private;
