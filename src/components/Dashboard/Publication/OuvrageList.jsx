import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';

const OuvrageList = () => {
    const [ouvrages, setOuvrages] = useState([]);
    const { accessToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fonction pour charger les ouvrages
    const fetchOuvrages = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/ouvrages', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setOuvrages(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des ouvrages:', error);
            setError('Erreur lors du chargement des ouvrages');
            toast.error('Erreur lors du chargement des ouvrages');
        } finally {
            setLoading(false);
        }
    };

    // Charger les ouvrages au montage du composant
    useEffect(() => {
        fetchOuvrages();
    }, [accessToken]);

    // Fonction de suppression
    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet ouvrage ?')) {
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:8000/api/ouvrages/${id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 204) {
                toast.success('Ouvrage supprimé avec succès');
                // Rafraîchir la liste après la suppression
                fetchOuvrages();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression de l\'ouvrage';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Liste des Ouvrages</h1>
            <div className="grid gap-4">
                {ouvrages.map((ouvrage) => (
                    <div key={ouvrage.id} className="border p-4 rounded shadow">
                        <h2 className="text-xl font-semibold">{ouvrage.title}</h2>
                        <p>Auteur(s): {ouvrage.author}</p>
                        <p>DOI: {ouvrage.DOI}</p>
                        <p>Date de publication: {ouvrage.date_publication}</p>
                        <div className="mt-2">
                            <button
                                onClick={() => handleDelete(ouvrage.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OuvrageList; 