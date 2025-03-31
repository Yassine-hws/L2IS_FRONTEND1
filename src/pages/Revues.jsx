import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Revues = () => {
    const [revues, setRevues] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/api/revues/acceptes')
            .then(response => {
                setRevues(response.data);
            })
            .catch(error => {
                setError('Erreur lors de la récupération des revues');
            });
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Date non disponible';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Revues</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {revues.length > 0 ? (
                <ul className="space-y-4">
                    {revues.map(revue => (
                        <li key={revue.id} className="bg-white p-6 rounded-lg shadow-md">
                            <strong className="text-xl font-semibold">{revue.title || 'Titre non disponible'}</strong>
                            <p className="text-gray-600 mt-2">{revue.author || 'Auteur non disponible'}</p>
                            <p className="text-gray-500 mt-2">Publié le {formatDate(revue.date_publication)}</p>
                            {revue.DOI ? (
                                <a
                                    href={`https://doi.org/${revue.DOI}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
                                >
                                    DOI
                                </a>
                            ) : (
                                <span className="text-gray-500 mt-2">DOI non disponible</span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">Aucune revue disponible.</p>
            )}
        </div>
    );
};

export default Revues;