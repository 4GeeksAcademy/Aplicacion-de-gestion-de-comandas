import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const token = localStorage.getItem("token");
	const user = localStorage.getItem("user");

	const isAuthenticated = !!token;
	const handleLogout = () => {
		console.log("Token antes de borrar:", localStorage.getItem("token"));
		localStorage.removeItem("token");
		console.log("Token después de borrar:", localStorage.getItem("token"));
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-red bg-danger">

			<div className="container">
				<div className="ms-auto d-flex align-items-center">
					{!token ? (
						<>
							{location.pathname === "/login" && (
								<Link to="/signup">
									<button className="btn btn-outline-light me-2">
										Registrarse
									</button>
								</Link>
							)}
							<Link to="/login">
								<button className="btn btn-outline-light me-2">
									Iniciar sesión
								</button>
							</Link>
						</>
					) : (
						<>
							<span className="me-2 text-white">👤 {user}</span>
							<button className="btn btn-light" onClick={handleLogout}>
								Logout
							</button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};