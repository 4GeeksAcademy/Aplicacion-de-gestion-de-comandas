
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  const user = token && rawUser ? JSON.parse(rawUser) : null;

  const [isNavOpen, setIsNavOpen] = useState(false);
  /* useEffect(() => {
           if (user) {
           console.log("Email del usuario:", user.email);
           console.log("Nombre del usuario:", user.name);
         }
       }, [user]);*/

  const handleLogout = () => {

    //localStorage.removeItem("user"); //console.log("Token antes de borrar:", localStorage.getItem("token"));
    //localStorage.removeItem("token");
    //console.log("Token después de borrar:", localStorage.getItem("token"));
    //elimino del localStorage tanto el token como el user    localStorage.clear();
    navigate("/login");
  };

  const handleClose = () => {
    Swal.fire({
      title: "¡See you soon!",
      text: "Thank you for using the Hayashi Sushi Bar app 😊🍜",
      icon: "info",
      confirmButtonText: "Close",
      confirmButtonColor: "#e4a2b0",
    }).then(() => {
      handleLogout();
    });
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{
      background: "linear-gradient(to bottom, #191823, #2f2531)",
      boxShadow: "0 6px 20px #e4a2b0",
      zIndex: 10,
    }}
    >
      <div className="container">
        <Link className="navbar-brand text-white fs-4" to="/">
          <i className="fas fa-store"></i> Hayashi Sushi Bar 🍣🌸
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsNavOpen(!isNavOpen)}
          style={{
            border: "2px solid #e4a2b0",
            borderRadius: "5px",
            padding: "4px 10px",
            backgroundColor: "transparent",
          }}
        >
          <i className="fas fa-bars" style={{ color: "#e4a2b0", fontSize: "20px" }}></i>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            {!token ? (
              <li className="nav-item">
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {location.pathname === "/login" && (
                    <Link to="/register" className="btn btn-outline-light">
                      Sign Up
                    </Link>
                  )}
                  {location.pathname === "/register" && (
                    <Link to="/login" className="btn btn-outline-light">
                      Log in
                    </Link>
                  )}
                  {location.pathname === "/request-reset-password" && (
                    <>
                      <Link to="/login" className="btn btn-outline-light">
                        Log in
                      </Link>
                      <Link to="/register" className="btn btn-outline-light">
                        Sign Up
                      </Link>
                    </>
                  )}
                  <button className="btn btn-outline-light" onClick={handleClose}>
                    Close
                  </button>
                </div>
              </li>
            ) : (
              <>
                {user && (
                  <li className="nav-item text-white me-3">
                    👤 {user.name}
                  </li>
                )}
                <li className="nav-item d-flex flex-wrap gap-2 mt-2">
                  <button className="btn btn-outline-light me-2" onClick={handleLogout}>
                    Logout
                  </button>

                  <button
                    className="btn btn-outline-light"
                    onClick={() => {
                      Swal.fire({
                        title: "¡See you soon!",
                        text: "Thank you for using the Hayashi Sushi Bar app 😊🍜",
                        icon: "info",
                        confirmButtonText: "Close",
                        confirmButtonColor: "#e4a2b0",
                      }).then(() => {
                        handleLogout();
                      });
                    }}
                  >
                    Close
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
