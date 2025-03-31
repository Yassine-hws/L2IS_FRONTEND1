import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/authContext';
import { toast } from 'react-toastify';

const PublicationEnAttente = () => {
    const [publications, setPublications] = useState([]);
    const [error, setError] = useState('');
    const { accessToken } = useContext(AuthContext);

    useEffect(() => {
        fetchPublicationsEnAttente();
    }, [accessToken]);

    const fetchPublicationsEnAttente = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/publications-en-attente', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setPublications(response.data);
        } catch (error) {
            setError('Erreur lors de la récupération des publications');
            console.error('Erreur:', error);
        }
    };

    const handleApprove = async (id, type) => {
        try {
            await axios.put(`http://localhost:8000/api/publications/${id}/approve`, {
                type: type
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            toast.success('Publication approuvée avec succès');
            fetchPublicationsEnAttente();
        } catch (error) {
            toast.error('Erreur lors de l\'approbation');
            console.error('Erreur:', error);
        }
    };

    const handleReject = async (id, type) => {
        try {
            await axios.put(`http://localhost:8000/api/publications/${id}/reject`, {
                type: type
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            toast.success('Publication rejetée');
            fetchPublicationsEnAttente();
        } catch (error) {
            toast.error('Erreur lors du rejet');
            console.error('Erreur:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Publications en attente</h1>
            {error && <div className="alert alert-danger">{error}</div>}

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>Type</th>
                        <th>DOI</th>
                        <th>Date de publication</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {publications.map((publication) => (
                        <tr key={publication.id}>
                            <td>{publication.title}</td>
                            <td>{publication.author}</td>
                            <td>{publication.type}</td>
                            <td>
                                {publication.DOI ? (
                                    <a href={`https://doi.org/${publication.DOI}`} target="_blank" rel="noopener noreferrer">
                                        {publication.DOI}
                                    </a>
                                ) : 'Pas de DOI'}
                            </td>
                            <td>{publication.date_publication ? new Date(publication.date_publication).toLocaleDateString('fr-FR') : 'Non spécifiée'}</td>
                            <td>{publication.status}</td>
                            <td>
                                <button
                                    onClick={() => handleApprove(publication.id, publication.type)}
                                    className="btn btn-success btn-sm me-2"
                                >
                                    Approuver
                                </button>
                                <button
                                    onClick={() => handleReject(publication.id, publication.type)}
                                    className="btn btn-danger btn-sm"
                                >
                                    Rejeter
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PublicationEnAttente;