import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id'); // Asegúrate de guardar esto en login

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.result);
        setAvatarUrl(data.result.avatar_url); // poner esta variable en el model.py
      } else {
        console.error(data.msg);
      }
    } catch (err) {
      console.error("Error charging use:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', 'react_unsigned'); // Tu preset de Cloudinary

    try {
      setUploading(true);
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dv1jtowez/image/upload',
        formData
      );
      const imageUrl = res.data.secure_url;
      setAvatarUrl(imageUrl);
      await updateAvatarBackend(imageUrl);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
    } finally {
      setUploading(false);
    }
  };

  const updateAvatarBackend = async (url) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatar_url: url })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.msg);
      }
    } catch (err) {
      console.error("Error actualizando avatar:", err);
    }
  };

  if (!user) return <p className="text-light">Cargando perfil...</p>;

  return (
    <div className="container text-light py-4">
      <h2>Perfil de Usuario</h2>
      <div className="mb-3">
        <label className="form-label">Nombre:</label>
        <p>{user.nombre}</p>
      </div>

      <div className="mb-3">
        <label className="form-label">Avatar:</label><br />
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" style={{ width: "150px", borderRadius: "50%" }} />
        ) : (
          <p>Sin imagen</p>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Subir nueva imagen:</label>
        <input type="file" className="form-control" onChange={handleImageUpload} />
        {uploading && <p>Subiendo imagen...</p>}
      </div>
    </div>
  );
};

export default UserProfile;