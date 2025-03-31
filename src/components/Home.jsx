import React, { useState, useEffect } from 'react';
import defaultLogo from '../assets/labol2is.png';  // Logo par défaut
import arrowGif from '../assets/fleche.gif';
import HomeNews from './HomeNews';
import parse from 'html-react-parser';
import JobOffersList from '../pages/JobOffersList';
import axios from 'axios';

const Home = ({ currentUser, logoutUser, isSidebarVisible, toggleSidebar }) => {
    const [descriptions, setDescriptions] = useState('');
    const [image, setImage] = useState('');
    const [logo, setLogo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // État de chargement

    useEffect(() => {
        const fetchDescription = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/home-descriptions');
                setDescriptions(response.data.content);
                setImage(`http://localhost:8000/storage/${response.data.image}`);

                // Si un logo est disponible, on le charge
                if (response.data.logo) {
                    setLogo(`http://localhost:8000/storage/${response.data.logo}`);
                } else {
                    setLogo(defaultLogo); // Sinon, utiliser le logo par défaut
                }

            } catch (err) {
                setError('Erreur lors de la récupération des descriptions.');
            } finally {
                setLoading(false); // Fin du chargement
            }
        };

        fetchDescription();
    }, []);

    return (
        <div className="p-6 flex flex-col items-center min-h-screen">
            {/* Section Logo */}
            <div className="flex items-center mb-6">
                {loading ? (
                    <div className="animate-pulse h-36 w-36 bg-gray-300 rounded-full"></div> // Effet de chargement
                ) : (
                    <img
                        src={logo}
                        alt="Laboratory Logo"
                        className="h-36 transition-opacity duration-500 ease-in-out"
                        onError={(e) => (e.target.src = defaultLogo)} // Si erreur, charger le logo par défaut
                    />
                )}
            </div>

            {/* Title */}
            <h1 className="text-4xl mt-6 mb-4 text-center text-indigo-900 font-extrabold tracking-tight">
                L2IS - Laboratoire d'Ingénierie Informatique et Systèmes
            </h1>

            {error && (
                <p className="text-red-700 bg-red-100 border-l-4 border-red-700 rounded-r-lg p-4 mb-4 font-medium relative">
                    {error}
                    <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-red-700 opacity-50 animate-ping">!</span>
                </p>
            )}

            {/* Description & Image Side by Side */}
            {descriptions && image && (
                <div className="flex flex-col md:flex-row items-center justify-center w-full bg-gradient-to-r from-sky-200 to-white py-12 px-6">
                    {/* Image on the Left (50%) */}
                    <div className="w-full md:w-1/2 flex justify-center p-4">
                        <img 
                            src={image} 
                            alt="Home Description" 
                            className="rounded-lg shadow-md w-full h-auto max-h-96 object-cover"
                        />
                    </div>
                
                    {/* Text on the Right (50%) */}
                    <div className="w-full md:w-1/2 p-4">
                        <div className="font-sans text-indigo-900 space-y-6">
                            <p className="text-lg leading-relaxed">
                                {parse(descriptions)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* List of News */}
            <JobOffersList />
        </div>
    );
};

export default Home;
