import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const BrevetAdmin = () => {
    const [brevets, setBrevets] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { accessToken, currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken && currentUser) {
            fetchBrevets();
        }
    }, [accessToken, currentUser]);

    const fetchBrevets = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/brevetsAdmin', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (Array.isArray(response.data)) {
                setBrevets(response.data);
            } else {
                setError('Erreur de données');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des brevets');
        }
    };

    const filteredBrevets = brevets.filter(brevet =>
        brevet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brevet.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brevet.DOI?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brevet.date_publication && brevet.date_publication.includes(searchQuery)) ||
        brevet.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Brevets</h1>

            <input
                type="text"
                className="form-control mb-3 w-25"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Link to="/dashboard/BrevetCreate" className="btn btn-primary mb-3">Ajouter un Brevet</Link>

            {error && <p className="text-danger">{error}</p>}

            <table className="table table-bordered table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>DOI</th>
                        <th>Date de publication</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBrevets.length ? (
                        filteredBrevets.map(brevet => (
                            <tr key={brevet.id}>
                                <td>{brevet.title}</td>
                                <td>{brevet.author}</td>
                                <td>
                                    {brevet.DOI ? (
                                        <a href={`https://doi.org/${brevet.DOI}`} target="_blank" rel="noopener noreferrer">
                                            {brevet.DOI}
                                        </a>
                                    ) : 'Pas de DOI'}
                                </td>
                                <td>{brevet.date_publication ? new Date(brevet.date_publication).toLocaleDateString('fr-FR') : 'Non spécifiée'}</td>
                                <td>{brevet.status}</td>
                                <td>
                                    <Link to={`/dashboard/BrevetEdit/${brevet.id}`} className="btn btn-primary mr-2">
                                        Modifier
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Aucun brevet disponible</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BrevetAdmin;
