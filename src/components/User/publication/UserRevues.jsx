import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';
import { useNavigate } from 'react-router-dom';

const UserRevue = () => {
    const [revues, setRevues] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRevues, setSelectedRevues] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { accessToken, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Function to fetch revues
    const fetchRevues = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/revues/user-or-contributor/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setRevues(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des revues:', error);
            toast.error('Erreur lors de la récupération des revues');
        }
    };

    useEffect(() => {
        fetchRevues();
    }, [accessToken]);

    // Delete a single revue
    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette revue ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/revuesUser/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                toast.success('Revue supprimée avec succès');
                fetchRevues();
            } catch (error) {
                console.error('Erreur lors de la suppression de la revue:', error);
                toast.error('Erreur lors de la suppression de la revue');
            }
        }
    };

    // Delete multiple revues
    const handleMassDelete = async () => {
        if (selectedRevues.length === 0) {
            alert("Veuillez sélectionner au moins une revue.");
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les revues sélectionnées ?')) {
            try {
                await Promise.all(selectedRevues.map(id =>
                    axios.delete(`http://localhost:8000/api/revuesUser/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                toast.success('Revues supprimées avec succès');
                fetchRevues();
                setSelectedRevues([]);
            } catch (error) {
                console.error("Erreur lors de la suppression en masse:", error);
                toast.error("Erreur lors de la suppression en masse");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/user/UserEditRevue/${id}`);
    };

    const handleSelectRevue = (id) => {
        setSelectedRevues(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    // Filter revues based on search term
    const filteredRevues = revues.filter(revue =>
        revue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revue.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const pageCount = Math.ceil(filteredRevues.length / itemsPerPage);
    const paginatedRevues = filteredRevues.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Liste des Revues</h1>
            
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher une revue..."
                    className="form-control w-25"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={() => navigate('/user/UserCreateRevue')}
                className="btn btn-primary mb-4"
            >
                Ajouter une Revue
            </button>
            <div className="mb-4">
                <button
                    onClick={handleMassDelete}
                    className="btn btn-danger mb-4"
                    disabled={selectedRevues.length === 0}
                >
                    Supprimer
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRevues(filteredRevues.map(revue => revue.id));
                                        } else {
                                            setSelectedRevues([]);
                                        }
                                    }}
                                    checked={selectedRevues.length === filteredRevues.length && filteredRevues.length > 0}
                                />
                            </th>
                            <th>Titre</th>
                            <th>Auteur(s)</th>
                            <th>DOI</th>
                            <th>Statut</th>
                            <th>Date de Publication</th> {/* Added Date column */}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRevues.length ? (
                            paginatedRevues.map(revue => (
                                <tr key={revue.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRevues.includes(revue.id)}
                                            onChange={() => handleSelectRevue(revue.id)}
                                        />
                                    </td>
                                    <td>{revue.title || 'Titre non disponible'}</td>
                                    <td>{revue.author || 'Auteur non disponible'}</td>
                                    <td>
                                        {revue.DOI ? (
                                            <a
                                                href={`https://doi.org/${revue.DOI}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                    const isValidDOI = revue.DOI.startsWith('10.');
                                                    if (!isValidDOI) {
                                                        e.preventDefault();
                                                        alert('Le DOI fourni semble invalide ou non trouvé. Vous pouvez essayer le lien PDF si disponible.');
                                                    }
                                                }}
                                            >
                                                {revue.DOI}
                                            </a>
                                        ) : (
                                            'Pas de DOI disponible'
                                        )}
                                    </td>
                                    <td>{revue.status}</td>
                                    <td>{revue.date_publication ? new Date(revue.date_publication).toLocaleDateString() : 'Date non disponible'}</td> {/* Added Date display */}
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <button
                                                onClick={() => handleEdit(revue.id)}
                                                className="btn btn-primary mb-2"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(revue.id)}
                                                className="btn btn-danger mb-2"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">Aucune revue trouvée</td>
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

export default UserRevue;
