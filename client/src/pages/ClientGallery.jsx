import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Gallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    axios.get('/api/gallery/photos') // Adjust the API path as per your backend route
      .then(res => setImages(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `/uploads/${filename}`; // or however your download route is defined
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Gallery</h2>
      {images.map((img, i) => (
        <div key={i}>
          <img src={img.url} alt={`Photo ${i + 1}`} style={{ maxWidth: '300px' }} />
          <button onClick={() => handleDownload(img.filename)}>Download</button>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
