import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";


const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search); //direccion url
    const token = query.get("token");
    const verified = query.get("verified"); // leemos si ?verified=true viene en la URL

    console.log(token) 
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    console.log(BASE_URL);

    useEffect(() => {
        if (verified === 'true') { //si el token esta verificado
            setShowVerifiedMessage(true); //fijo mensaje en true
            setTimeout(() => setShowVerifiedMessage(false), 9000); //lo dejo por 9 segundos 
        }
    }, [verified]); //esto lo hago cada vez q se modifique verified 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);


        if (newPassword.length < 6) {
            setError('Password should have 6 characters or more');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords does not match');
            return;
        }

        setError(null); // Limpiar errores si pasa validaciones

        try {
            const response = await fetch(BASE_URL + `/api/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword, confirm_password: confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                //setMessage(data.msg);
                setMessage("Password reset successfully! Redirecting to login...");
                console.log(data);
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');
                
                setTimeout(() => {
                    navigate("/login?reset=true");
                }, 5000);


            } else {
                setError(data.msg || 'Unknow Error');
            }
        } catch (err) {
            setError('Error trying to conect to the server');
        }
    };

    if (!token) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="alert alert-danger text-center rounded-3 shadow p-4" style={{ backgroundColor: "#ffe5e5", color: "#b30000" }}>
                    ❌ Token expired or invalid. Please request a new reset link.
                </div>
            </div>
        );
    }
  
    //if (!token) return <p>Token inválido o expirado.</p>;
    return (
        <>
            {showVerifiedMessage && (
                <div className="alert alert-success text-center rounded-3 shadow-sm fw-bold" style={{ backgroundColor: "#e0ffe0", color: "#2e7d32" }}>
                    ✅ Email verified successfully!
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="register-background d-flex align-items-start justify-content-start w-100 vh-100 p-4"
            >
                <div
                    className="w-100 p-4"
                    style={{
                        maxWidth: "320px",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(4px)", // Efecto glass suave
                        width: "100%",
                        zIndex: 1, // Asegura que quede por encima del filtro del fondo
                        position: "relative",

                    }}
                >
                    <h2 className="mb-3 fw-bold">Reset Password</h2>

                    <div className="mb-2">
                        <input
                            className="form-control"
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-2">

                        <input
                            className="form-control"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>


                    <button
                        type="submit"
                        className="btn w-100"
                        style={{
                            backgroundColor: "#fa8072",
                            color: "white",
                            fontWeight: "bold",
                            border: "none",

                            transition: "background-color 0.3s"
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = "#e76b60")}
                        onMouseOut={(e) => (e.target.style.backgroundColor = "#fa8072")}
                    >
                        Reset Password
                    </button>


                    {message && <div className="alert alert-success">{message}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}


                </div >
            </form>
        </>
    );
    
};

export default ResetPassword;