import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const BrevetAdmin = () => {
    const [brevets, setBrevets] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedBrevets, setSelectedBrevets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { accessToken } = useContext(AuthContext);

    useEffect(() => {
        const fetchBrevets = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/brevetsAdmin', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (Array.isArray(response.data)) {
                    setBrevets(response.data);
                } else {
                    console.error('Les données reçues ne sont pas un tableau');
                    setError('Erreur de données');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des brevets:', error);
                setError('Erreur lors de la récupération des brevets');
            }
        };

        fetchBrevets();
    }, [accessToken]);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce brevet ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/brevets/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setBrevets(brevets.filter(brevet => brevet.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression du brevet:', error);
                setError('Erreur lors de la suppression du brevet');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les brevets sélectionnés ?')) {
            try {
                await Promise.all(selectedBrevets.map(id =>
                    axios.delete(`http://localhost:8000/api/brevets/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setBrevets(brevets.filter(brevet => !selectedBrevets.includes(brevet.id)));
                setSelectedBrevets([]);
            } catch (error) {
                setError("Erreur lors de la suppression des brevets");
            }
        }
    };

    const pageCount = Math.ceil(brevets.length / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    const currentBrevets = brevets.slice(offset, offset + itemsPerPage);

    // Filter brevets based on the search query for all relevant attributes
    const filteredBrevets = currentBrevets.filter(brevet =>
        brevet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brevet.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brevet.doi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brevet.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brevet.date_publication && brevet.date_publication.includes(searchQuery))
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="container">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Brevets</h1>
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

            <Link to="/dashboard/BrevetCreate" className="btn btn-primary mb-2">Ajouter un Brevet</Link>

            {/* Bulk Delete Button */}
            <div className="mb-4">
                <button className="btn btn-danger" onClick={handleBulkDelete} disabled={selectedBrevets.length === 0}>
                    Supprimer
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedBrevets(currentBrevets.map(brevet => brevet.id));
                                        } else {
                                            setSelectedBrevets([]);
                                        }
                                    }}
                                    checked={selectedBrevets.length === currentBrevets.length && currentBrevets.length > 0}
                                />
                            </th>
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
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedBrevets.includes(brevet.id)}
                                            onChange={() => {
                                                if (selectedBrevets.includes(brevet.id)) {
                                                    setSelectedBrevets(selectedBrevets.filter(id => id !== brevet.id));
                                                } else {
                                                    setSelectedBrevets([...selectedBrevets, brevet.id]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>{brevet.title}</td>
                                    <td>{brevet.author}</td>
                                    <td>
                                        {brevet.doi ? (
                                            <a
                                                href={`https://doi.org/${brevet.doi}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                    const isValidDOI = brevet.doi.startsWith('10.');
                                                    if (!isValidDOI) {
                                                        e.preventDefault();
                                                        alert('Le DOI fourni semble invalide ou non trouvé. Vous pouvez essayer le lien PDF si disponible.');
                                                    }
                                                }}
                                            >
                                                {brevet.doi}
                                            </a>
                                        ) : (
                                            'Pas de DOI disponible'
                                        )}
                                    </td>
                                    <td>
                                        {brevet.date_publication 
                                            ? new Date(brevet.date_publication).toLocaleDateString('fr-FR') 
                                            : 'Non spécifiée'}
                                    </td>
                                    <td>{brevet.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <Link to={`/dashboard/BrevetEdit/${brevet.id}`} className="btn btn-primary mb-2">
                                                <i className="bi bi-pencil"></i>
                                            </Link>
                                            <button onClick={() => handleDelete(brevet.id)} className="btn btn-danger mb-2">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
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

export default BrevetAdmin;
