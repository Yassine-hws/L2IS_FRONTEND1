import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import arrowGif from '../assets/fleche.gif';

const JobOffersList = () => {
    const [jobOffers, setJobOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobOffers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/job-offers');
                setJobOffers(response.data);
            } catch (err) {
                setError('Erreur lors de la récupération des offres d\'emploi.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobOffers();
    }, []);

    const getSnippet = (description) => {
        return description.length > 100 ? description.substring(0, 100) + '...' : description;
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#1A237E] mb-4">
                        Appel à Inscription au Doctorat et Stages de Recherche
                    </h2>
                    <img
                        src={arrowGif}
                        alt="Flèche animée"
                        className="h-16 w-auto"
                    />
                </div>

                {jobOffers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobOffers.map((offer) => (
                            <div
                                key={offer.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6"
                            >
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    {offer.title}
                                </h2>
                                <p className="text-gray-600 mb-6 text-base leading-relaxed">
                                    {getSnippet(offer.description)}
                                </p>
                                <div className="space-y-2 mb-6">
                                    <p className="text-gray-700 text-base flex items-center">
                                        <FaMapMarkerAlt className="text-blue-400 mr-2" />
                                        {offer.location}
                                    </p>
                                    <p className="text-gray-700 text-base flex items-center">
                                        <FaCalendarAlt className="text-blue-400 mr-2" />
                                        {new Date(offer.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <Link
                                    to={`/job-offers/${offer.id}`}
                                    className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-600 transition-colors duration-300"
                                >
                                    Lire la suite
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600 text-center">Aucune offre d'emploi disponible.</p>
                )}
            </div>
        </div>
    );
};

export default JobOffersList;