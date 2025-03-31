import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';
import { useNavigate } from 'react-router-dom';

const UserBrevet = () => {
    const [brevets, setBrevets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrevets, setSelectedBrevets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { accessToken, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchBrevets = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/brevets/user-or-contributor/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setBrevets(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des brevets:', error);
            toast.error('Erreur lors de la récupération des brevets');
        }
    };

    useEffect(() => {
        fetchBrevets();
    }, [accessToken]);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce brevet ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/brevetUser/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                toast.success('Brevet supprimé avec succès');
                fetchBrevets();
            } catch (error) {
                console.error('Erreur lors de la suppression du brevet:', error);
                toast.error('Erreur lors de la suppression du brevet');
            }
        }
    };

    const handleMassDelete = async () => {
        if (selectedBrevets.length === 0) {
            alert("Veuillez sélectionner au moins un brevet.");
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les brevets sélectionnés ?')) {
            try {
                await Promise.all(selectedBrevets.map(id =>
                    axios.delete(`http://localhost:8000/api/brevetUser/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                toast.success('Brevets supprimés avec succès');
                fetchBrevets();
                setSelectedBrevets([]);
            } catch (error) {
                console.error("Erreur lors de la suppression en masse:", error);
                toast.error("Erreur lors de la suppression en masse");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/user/UserEditBrevet/${id}`);
    };

    const handleSelectBrevet = (id) => {
        setSelectedBrevets(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const filteredBrevets = brevets.filter(brevet =>
        brevet.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brevet.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const pageCount = Math.ceil(filteredBrevets.length / itemsPerPage);
    const paginatedBrevets = filteredBrevets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Liste des Brevets</h1>
            
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher un brevet..."
                    className="form-control w-25"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={() => navigate('/user/UserCreateBrevet')}
                className="btn btn-primary mb-4"
            >
                Ajouter un Brevet
            </button>
            <div className="mb-4">
                <button
                    onClick={handleMassDelete}
                    className="btn btn-danger mb-4"
                    disabled={selectedBrevets.length === 0}
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
                                            setSelectedBrevets(filteredBrevets.map(brevet => brevet.id));
                                        } else {
                                            setSelectedBrevets([]);
                                        }
                                    }}
                                    checked={selectedBrevets.length === filteredBrevets.length && filteredBrevets.length > 0}
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
                        {paginatedBrevets.length ? (
                            paginatedBrevets.map(brevet => (
                                <tr key={brevet.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedBrevets.includes(brevet.id)}
                                            onChange={() => handleSelectBrevet(brevet.id)}
                                        />
                                    </td>
                                    <td>{brevet.title || 'Titre non disponible'}</td>
                                    <td>{brevet.author || 'Auteur non disponible'}</td>
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
                                    <td>{brevet.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <button
                                                onClick={() => handleEdit(brevet.id)}
                                                className="btn btn-primary mb-2"
                                            >
                                                <i className="bi bi-pencil"></i>
                                                </button>
                                            <button
                                                onClick={() => handleDelete(brevet.id)}
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
                                <td colSpan="6" className="text-center">Aucun brevet trouvé</td>
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

export default UserBrevet;
