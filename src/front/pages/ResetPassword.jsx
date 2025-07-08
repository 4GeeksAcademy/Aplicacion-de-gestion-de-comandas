import React, { useState } from 'react';
import { useParams, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const token = useParams();
    BASE_URL= import.meta.env.VITE_BACKEND_URL;


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);


        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setError(null); // Limpiar errores si pasa validaciones

        try {
            const response = await fetch(BASE_URL + `/api/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({password:newPassword, confirm_password:confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.msg);
                console.log(data);
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.msg || 'Error desconocido');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        }
    };
    if (!token) return <p>Token inválido o expirado.</p>;

    return (
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
    );
};

export default ResetPassword;