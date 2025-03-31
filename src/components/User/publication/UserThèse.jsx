import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';
import { useNavigate } from 'react-router-dom';

const UserThese = () => {
    const [theses, setTheses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTheses, setSelectedTheses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { accessToken, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fonction pour récupérer les thèses
    const fetchTheses = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/theses/user-or-contributor/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setTheses(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des thèses:', error);
            toast.error('Erreur lors de la récupération des thèses');
        }
    };

    useEffect(() => {
        fetchTheses();
    }, [accessToken]);

    // Suppression d'une seule thèse
    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette thèse ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/thesesUser/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                toast.success('Thèse supprimée avec succès');
                fetchTheses();
            } catch (error) {
                console.error('Erreur lors de la suppression de la thèse:', error);
                toast.error('Erreur lors de la suppression de la thèse');
            }
        }
    };

    // Suppression en masse des thèses sélectionnées
    const handleMassDelete = async () => {
        if (selectedTheses.length === 0) {
            alert("Veuillez sélectionner au moins une thèse.");
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les thèses sélectionnées ?')) {
            try {
                await Promise.all(selectedTheses.map(id =>
                    axios.delete(`http://localhost:8000/api/thesesUser/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                toast.success('Thèses supprimées avec succès');
                fetchTheses();
                setSelectedTheses([]);
            } catch (error) {
                console.error("Erreur lors de la suppression en masse:", error);
                toast.error("Erreur lors de la suppression en masse");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/user/UserEditThese/${id}`);
    };

    const handleSelectThese = (id) => {
        setSelectedTheses(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    // Filtrer les thèses selon le terme de recherche
    const filteredTheses = theses.filter(these =>
        these.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        these.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const pageCount = Math.ceil(filteredTheses.length / itemsPerPage);
    const paginatedTheses = filteredTheses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Liste des Thèses</h1>
            
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher une thèse..."
                    className="form-control w-25"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={() => navigate('/user/UserCreateThese')}
                className="btn btn-primary mb-4"
            >
                Ajouter une Thèse
            </button>
            <div className="mb-4">
                <button
                    onClick={handleMassDelete}
                    className="btn btn-danger mb-4"
                    disabled={selectedTheses.length === 0}
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
                                            setSelectedTheses(filteredTheses.map(these => these.id));
                                        } else {
                                            setSelectedTheses([]);
                                        }
                                    }}
                                    checked={selectedTheses.length === filteredTheses.length && filteredTheses.length > 0}
                                />
                            </th>
                            <th>Titre</th>
                            <th>Auteur(s)</th>
                            <th>DOI</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTheses.length ? (
                            paginatedTheses.map(these => (
                                <tr key={these.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedTheses.includes(these.id)}
                                            onChange={() => handleSelectThese(these.id)}
                                        />
                                    </td>
                                    <td>{these.title || 'Titre non disponible'}</td>
                                    <td>{these.author || 'Auteur non disponible'}</td>
                                    <td>
                                        {these.DOI ? (
                                            <a
                                                href={`https://doi.org/${these.DOI}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {these.DOI}
                                            </a>
                                        ) : (
                                            'Pas de DOI disponible'
                                        )}
                                    </td>
                                    <td>{these.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <button
                                                onClick={() => handleEdit(these.id)}
                                                className="btn btn-primary mb-2"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(these.id)}
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
                                <td colSpan="6" className="text-center">Aucune thèse trouvée</td>
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

export default UserThese;
