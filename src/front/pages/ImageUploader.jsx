import React from 'react'
import { useState } from 'react'
import Axios from 'axios'

import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "react_unsigned"); // el nombre de tu preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dv1jtowez/image/upload", // cambia cloud-name a la q esta en tu  cloudinary
        formData
      );
      setImageUrl(res.data.secure_url);
    } catch (err) {
      console.error("Error al subir imagen:", err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {imageUrl && <img src={imageUrl} alt="Imagen subida" width="200" />}
    </div>
  );
};

export default ImageUploader;


// npm install axios 