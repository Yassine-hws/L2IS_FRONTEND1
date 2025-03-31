import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateDescription = () => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [logo, setLogo] = useState(null); // NEW: Added state for logo
    const { accessToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Content is required.');
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }
        if (logo) {
            formData.append('logo', logo); // NEW: Adding logo file to FormData
        }

        try {
            const response = await axios.post('http://localhost:8000/api/home-descriptions', formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                toast.success('Description added successfully');
                navigate('/dashboard/AdminHomeDescription');
            } else {
                throw new Error('Unexpected server response');
            }
        } catch (error) {
            const errorMessage = error.response 
                ? `${error.response.data.message || 'Unknown server error'} - Code: ${error.response.status}`
                : error.message || 'Unknown error';
            
            console.error('Error adding description:', errorMessage);
            toast.error(`Error adding description: ${errorMessage}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Ajouter une Description</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="content" className="block text-gray-700">Contenu</label>
                    <ReactQuill
                        id="content"
                        value={content}
                        onChange={setContent}
                        placeholder="Enter content here..."
                        className="react-quill-editor border px-4 py-2 w-full"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="block text-gray-700">Image</label>
                    <input
                        type="file"
                        id="image"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="mt-1 block w-full"
                    />
                </div>

                {/* Logo Upload */}
                <div>
                    <label htmlFor="logo" className="block text-gray-700">Logo</label>
                    <input
                        type="file"
                        id="logo"
                        onChange={(e) => setLogo(e.target.files[0])} // NEW: Logo upload
                        className="mt-1 block w-full"
                    />
                </div>

                <button type="submit" className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600">
                    Ajouter
                </button>
            </form>

            <style jsx>{`
                .react-quill-editor .ql-editor {
                    text-align: left;
                    padding: 10px;
                    min-height: 150px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                }

                button:hover {
                    transform: scale(1.02);
                    transition: transform 0.2s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default CreateDescription;
