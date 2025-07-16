import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const rawUser = localStorage.getItem("user");
	const user = token && rawUser ? JSON.parse(rawUser) : null;
	console.log(user);


	/* useEffect(() => {
				 if (user) {
				 console.log("Email del usuario:", user.email);
				 console.log("Nombre del usuario:", user.name);
		   }
	   }, [user]);*/


	const isAuthenticated = !!token;
	const handleLogout = () => {
		//localStorage.removeItem("user"); //console.log("Token antes de borrar:", localStorage.getItem("token"));
		//localStorage.removeItem("token");
		//console.log("Token después de borrar:", localStorage.getItem("token"));
		//elimino del localStorage tanto el token como el user
		localStorage.clear()
		navigate("/login");
	};

	return (
		<nav className="navbar" style={{ backgroundColor: "#fa8072" }}>

			<div className="container">

				<div className="logo text-white fs-9">
					<i className="fas fa-store"></i> <span>Japanese Restaurant</span>
				</div>

				<div className="ms-auto d-flex align-items-center">
					{!token ? (
						<>
							{location.pathname === "/login" && (
								<Link to="/register" className="btn btn-outline-light me-2">
									Sign Up
								</Link>
							)}
							{location.pathname === "/register" && (
								<Link to="/login" className="btn btn-outline-light me-2">
									Log in
								</Link>
							)}
							{location.pathname === "/request-reset-password" && (
								<Link to="/login" className="btn btn-outline-light me-2">
									Log in
								</Link>
							)}
							{location.pathname === "/request-reset-password" && (
								<Link to="/login" className="btn btn-outline-light me-2">
									Sign Up
								</Link>
							)}

						</>
					) : (
						<>
							{user && <span className="me-2 text-white">👤 {user.name}</span>}
							<button className="btn btn-outline-light me-2" onClick={handleLogout}>
								Logout
							</button>
						</>
					)}
					<button



						className="btn btn-outline-light me-2"
						onClick={() => {
							Swal.fire({
								title: "¡See you soon!",
								text: "Thank you for use the Hana Sushi Bar app😊",
								icon: "info",
								confirmButtonText: "Close",
								confirmButtonColor: "#fa8072",
							}).then(() => {
								window.location.href = 'about:blank';
								handleLogout();
							});
						}}
					>
						Close
					</button>

				</div>
			</div>
		</nav>
	);
};
