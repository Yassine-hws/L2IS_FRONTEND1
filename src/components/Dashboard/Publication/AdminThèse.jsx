import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const AdminThese = () => {
    const [theses, setTheses] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedTheses, setSelectedTheses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const { accessToken, currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken && currentUser) {
            fetchTheses();
        }
    }, [accessToken, currentUser]);

    const fetchTheses = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/theseAdmin', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (Array.isArray(response.data)) {
                setTheses(response.data);
            } else {
                setError('Erreur de données');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des thèses');
        }
    };

    const pageCount = Math.ceil(theses.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const offset = (currentPage - 1) * itemsPerPage;
    
    // Filtrage des thèses selon les attributs pertinents
    const filteredTheses = theses
        .filter(these => 
            these.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            these.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            these.doi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (these.date && these.date.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (these.lieu && these.lieu.toLowerCase().includes(searchQuery.toLowerCase())) ||
            these.status.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(offset, offset + itemsPerPage);

    const handleSelect = (id) => {
        if (selectedTheses.includes(id)) {
            setSelectedTheses(selectedTheses.filter(theseId => theseId !== id));
        } else {
            setSelectedTheses([...selectedTheses, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les thèses sélectionnées ?')) {
            try {
                await Promise.all(
                    selectedTheses.map(id => 
                        axios.delete(`http://localhost:8000/api/theses/${id}`, {
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        })
                    )
                );
                setTheses(theses.filter(these => !selectedTheses.includes(these.id)));
                setSelectedTheses([]);
            } catch (error) {
                setError("Erreur lors de la suppression des thèses");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette thèse ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/theses/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setTheses(theses.filter(these => these.id !== id));
            } catch (error) {
                setError('Erreur lors de la suppression de la thèse');
            }
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Thèses</h1>

            {/* Barre de recherche */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Link to="/dashboard/TheseCreate" className="btn btn-primary mb-2">Ajouter une thèse</Link>

            <div className="mb-4">
                <button 
                    className="btn btn-danger" 
                    onClick={handleBulkDelete} 
                    disabled={selectedTheses.length === 0}
                >
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
                                        setSelectedTheses(filteredTheses.map(these => these.id));
                                    } else {
                                        setSelectedTheses([]);
                                    }
                                }}
                                checked={selectedTheses.length === filteredTheses.length && filteredTheses.length > 0}
                            />
                        </th>
                        <th>Titre</th>
                        <th>Auteur</th>
                        <th>DOI</th>
                        <th>Date</th>
                        <th>Lieu</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTheses.length ? (
                        filteredTheses.map(these => (
                            <tr key={these.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedTheses.includes(these.id)}
                                        onChange={() => handleSelect(these.id)}
                                    />
                                </td>
                                <td>{these.title}</td>
                                <td>{these.author}</td>
                                <td>
                                    {these.doi ? (
                                        <a
                                            href={`https://doi.org/${these.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {these.doi}
                                        </a>
                                    ) : 'Pas de DOI disponible'}
                                </td>
                                <td>{these.date || 'Pas de date disponible'}</td>
                                <td>{these.lieu || 'Pas de lieu disponible'}</td>
                                <td>{these.status}</td>
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/TheseEdit/${these.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(these.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">Aucune thèse disponible</td>
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

export default AdminThese;

