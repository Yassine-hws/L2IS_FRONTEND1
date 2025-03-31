import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const AdminHabilitation = () => {
    const [habilitations, setHabilitations] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedHabilitations, setSelectedHabilitations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { accessToken } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken) {
            fetchHabilitations();
        }
    }, [accessToken]);

    const fetchHabilitations = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/habilitationAdmin', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (Array.isArray(response.data)) {
                setHabilitations(response.data);
            } else {
                setError('Erreur de données');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des habilitations');
        }
    };

    const pageCount = Math.ceil(habilitations.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const offset = (currentPage - 1) * itemsPerPage;

    // Filtrer par tous les attributs
    const currentHabilitations = habilitations
        .filter(habilitation => 
            Object.values(habilitation).some(attr => 
                attr && attr.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .slice(offset, offset + itemsPerPage);

    const handleSelect = (id) => {
        setSelectedHabilitations(prev =>
            prev.includes(id) ? prev.filter(habilitationId => habilitationId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les habilitations sélectionnées ?')) {
            try {
                await Promise.all(
                    selectedHabilitations.map(id => 
                        axios.delete(`http://localhost:8000/api/habilitations/${id}`, {
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        })
                    )
                );
                setHabilitations(habilitations.filter(habilitation => !selectedHabilitations.includes(habilitation.id)));
                setSelectedHabilitations([]);
            } catch (error) {
                setError("Erreur lors de la suppression des habilitations");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette habilitation ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/habilitations/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setHabilitations(habilitations.filter(habilitation => habilitation.id !== id));
            } catch (error) {
                setError('Erreur lors de la suppression de l\'habilitation');
            }
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Habilitations</h1>

            {/* Search Bar */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Link to="/dashboard/HabilitationCreate" className="btn btn-primary mb-2">Ajouter une Habilitation</Link>

            <div className="mb-4">
                <button 
                    className="btn btn-danger" 
                    onClick={handleBulkDelete} 
                    disabled={selectedHabilitations.length === 0}
                >
                    Supprimer
                </button>
            </div>

            {error && <p className="text-danger">{error}</p>}

            <div className="table-responsive">
                <table className="table table-bordered table-striped table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        setSelectedHabilitations(
                                            e.target.checked ? currentHabilitations.map(habilitation => habilitation.id) : []
                                        );
                                    }}
                                    checked={
                                        selectedHabilitations.length === currentHabilitations.length && 
                                        currentHabilitations.length > 0
                                    }
                                />
                            </th>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>DOI</th>
                            <th>Lieu</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentHabilitations.length ? (
                            currentHabilitations.map(habilitation => (
                                <tr key={habilitation.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedHabilitations.includes(habilitation.id)}
                                            onChange={() => handleSelect(habilitation.id)}
                                        />
                                    </td>
                                    <td>{habilitation.title}</td>
                                    <td>{habilitation.author}</td>
                                    <td>
                                        {habilitation.doi ? (
                                            <a
                                                href={`https://doi.org/${habilitation.doi}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {habilitation.doi}
                                            </a>
                                        ) : 'Pas de DOI disponible'}
                                    </td>
                                    <td>{habilitation.lieu || 'Pas de lieu disponible'}</td>
                                    <td>{habilitation.date || 'Pas de date disponible'}</td>
                                    <td>{habilitation.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <Link to={`/dashboard/HabilitationEdit/${habilitation.id}`} className="btn btn-primary mb-2">
                                                <i className="bi bi-pencil"></i>
                                            </Link>
                                            <button onClick={() => handleDelete(habilitation.id)} className="btn btn-danger mb-2">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">Aucune habilitation disponible</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            aria-label="Previous"
                        >
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    {[...Array(pageCount)].map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                        <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            aria-label="Next"
                        >
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminHabilitation;
