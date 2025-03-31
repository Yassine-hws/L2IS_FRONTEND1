import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill editor style

const NewsCreate = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Initial content state
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext); // Get token from context

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content); // Append content
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:8000/api/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}` // Include token in headers
        },
      });
      console.log('News added:', response.data);
      toast.success('News added successfully');
      navigate('/dashboard/NewsAdmin'); // Redirect to admin page after addition
    } catch (error) {
      console.error('Error adding news', error);
      setError('Error adding news');
      toast.error('Error adding news');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ajouter Actualité</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contenu</label>
          <ReactQuill
            value={content}
            onChange={setContent}
            placeholder="Enter content here..."
            className="border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input 
            type="file" 
            onChange={(e) => setImage(e.target.files[0])} 
            accept="image/*" 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white py-1 px-4  rounded hover:bg-green-600">
                    Ajouter
                </button>
      </form>

      <style jsx>{`
        .react-quill {
          height: 200px; /* Set height for the editor */
        }
      `}</style>
    </div>
  );
};

export default NewsCreate;
