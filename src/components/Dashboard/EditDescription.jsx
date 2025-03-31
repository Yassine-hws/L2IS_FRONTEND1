import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditDescription = () => {
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [logo, setLogo] = useState(null); // NEW: Logo state
    const [previewImage, setPreviewImage] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null); // NEW: Logo preview
    const { accessToken } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDescription();
    }, [id]);

    const fetchDescription = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/home-descriptions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            setContent(response.data.content);

            if (response.data.image) {
                setPreviewImage(`http://localhost:8000/storage/${response.data.image}`);
            }
            if (response.data.logo) { // NEW: Fetch existing logo
                setPreviewLogo(`http://localhost:8000/storage/${response.data.logo}`);
            }
        } catch (error) {
            const errorMessage = error.response
                ? `${error.response.data.message || 'Unknown server error'} - Code: ${error.response.status}`
                : error.message || 'Unknown error';

            console.error('Error fetching description:', errorMessage);
            toast.error(`Error fetching description: ${errorMessage}`);
        }
    };

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
        if (logo) { // NEW: Append logo to formData
            formData.append('logo', logo);
        }
        formData.append('_method', 'PUT'); // Laravel requires this for updates

        try {
            const response = await axios.post(`http://localhost:8000/api/home-descriptions/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                toast.success('Description updated successfully');
                navigate('/dashboard/AdminHomeDescription');
            } else {
                throw new Error('Unexpected server response');
            }
        } catch (error) {
            const errorMessage = error.response
                ? `${error.response.data.message || 'Unknown server error'} - Code: ${error.response.status}`
                : error.message || 'Unknown error';

            console.error('Error updating description:', errorMessage);
            toast.error(`Error updating description: ${errorMessage}`);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e) => { // NEW: Handle logo change
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Modifier la Description</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="content" className="block text-gray-700">Contenu</label>
                    <ReactQuill
                        id="content"
                        value={content}
                        onChange={setContent}
                        placeholder="Enter content here..."
                        className="border px-4 py-2 w-full"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="block text-gray-700">Image</label>
                    <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        className="mt-1 block w-full"
                    />
                    {previewImage && (
                        <div className="mt-4">
                            <img 
                                src={previewImage} 
                                alt="Current Description" 
                                className="max-w-full h-auto rounded"
                                style={{ maxWidth: '200px' }}
                            />
                        </div>
                    )}
                </div>

                {/* Logo Upload */}
                <div>
                    <label htmlFor="logo" className="block text-gray-700">Logo</label>
                    <input
                        type="file"
                        id="logo"
                        onChange={handleLogoChange}
                        className="mt-1 block w-full"
                    />
                    {previewLogo && (
                        <div className="mt-4">
                            <img 
                                src={previewLogo} 
                                alt="Current Logo" 
                                className="max-w-full h-auto rounded"
                                style={{ maxWidth: '200px' }}
                            />
                        </div>
                    )}
                </div>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Mettre à jour
                </button>
            </form>
        </div>
    );
};

export default EditDescription;
