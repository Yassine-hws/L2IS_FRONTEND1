import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const RevueAdmin = () => {
    const [revues, setRevues] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedRevues, setSelectedRevues] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [date_publication, setDatePublication] = useState(new Date().toISOString().split('T')[0]);

    const { accessToken, currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken && currentUser) {
            fetchRevues();
        }
    }, [accessToken, currentUser]);

    const fetchRevues = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/revuesAdmin', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (Array.isArray(response.data)) {
                setRevues(response.data);
            } else {
                setError('Erreur de données');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des revues');
        }
    };

    const pageCount = Math.ceil(revues.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const offset = (currentPage - 1) * itemsPerPage;
    const currentRevues = revues.slice(offset, offset + itemsPerPage);

    const handleSelect = (id) => {
        if (selectedRevues.includes(id)) {
            setSelectedRevues(selectedRevues.filter(revueId => revueId !== id));
        } else {
            setSelectedRevues([...selectedRevues, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les revues sélectionnées ?')) {
            try {
                await Promise.all(selectedRevues.map(id => 
                    axios.delete(`http://localhost:8000/api/revues/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setRevues(revues.filter(revue => !selectedRevues.includes(revue.id)));
                setSelectedRevues([]);
            } catch (error) {
                setError("Erreur lors de la suppression des revues");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette revue ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/revues/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setRevues(revues.filter(revue => revue.id !== id));
            } catch (error) {
                setError('Erreur lors de la suppression de la revue');
            }
        }
    };

    // Filter revues based on the search query
    const filteredRevues = revues.filter(revue =>
        revue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revue.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        revue.DOI?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (revue.date_publication && revue.date_publication.includes(searchQuery)) ||
        revue.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Revues</h1>
            
            {/* Search Bar */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25" // Adjust the width here
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Link to="/dashboard/RevueCreate" className="btn btn-primary mb-2">Ajouter une Revue</Link>

            <div className="mb-4">
                <button className="btn btn-danger" onClick={handleBulkDelete} disabled={selectedRevues.length === 0}>
                    Supprimer
                </button>
            </div>
            {error && <p className="text-danger">{error}</p>}

            <table className="table table-bordered table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRevues(currentRevues.map(revue => revue.id));
                                    } else {
                                        setSelectedRevues([]);
                                    }
                                }}
                                checked={selectedRevues.length === currentRevues.length && currentRevues.length > 0}
                            />
                        </th>
                        <th scope="col">Titre</th>
                        <th scope="col">Auteur</th>
                        <th scope="col">DOI</th>
                        <th scope="col">Date de publication</th>
                        <th scope="col">Statut</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRevues.length ? (
                        filteredRevues.slice(offset, offset + itemsPerPage).map(revue => (
                            <tr key={revue.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedRevues.includes(revue.id)}
                                        onChange={() => handleSelect(revue.id)}
                                    />
                                </td>
                                <td>{revue.title}</td>
                                <td>{revue.author}</td>
                                <td>
                                    {revue.DOI ? (
                                        <a href={`https://doi.org/${revue.DOI}`} target="_blank" rel="noopener noreferrer">
                                            {revue.DOI}
                                        </a>
                                    ) : (
                                        'Pas de DOI disponible'
                                    )}
                                </td>
                                <td>{revue.date_publication ? new Date(revue.date_publication).toLocaleDateString('fr-FR') : 'Non spécifiée'}</td>
                                <td>{revue.status}</td>
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/RevuesEdit/${revue.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(revue.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Aucune revue disponible</td>
                        </tr>
                    )}
                </tbody>
            </table>

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

export default RevueAdmin;
