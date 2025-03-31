import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';

const UserRapport = () => {
    const [rapports, setRapports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRapports, setSelectedRapports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const { currentUser, accessToken } = useContext(AuthContext);

    const fetchRapports = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/rapports/user-or-contributor/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setRapports(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des rapports:', error);
            toast.error('Erreur lors de la récupération des rapports');
        }
    };

    useEffect(() => {
        fetchRapports();
    }, [currentUser.id, accessToken]);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.')) {
            try {
                await axios.delete(`http://localhost:8000/api/rapportUser/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                toast.success('Rapport supprimé avec succès');
                fetchRapports();
            } catch (error) {
                console.error('Erreur lors de la suppression du rapport:', error);
                toast.error('Erreur lors de la suppression du rapport');
            }
        }
    };

    const handleMassDelete = async () => {
        if (selectedRapports.length === 0) {
            alert("Veuillez sélectionner au moins un rapport.");
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les rapports sélectionnés ?')) {
            try {
                await Promise.all(selectedRapports.map(id =>
                    axios.delete(`http://localhost:8000/api/rapportUser/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                toast.success('Rapports supprimés avec succès');
                fetchRapports();
                setSelectedRapports([]);
            } catch (error) {
                console.error("Erreur lors de la suppression en masse:", error);
                toast.error("Erreur lors de la suppression en masse");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/user/UserEditRapport/${id}`);
    };

    const handleSelectRapport = (id) => {
        setSelectedRapports(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const filteredRapports = rapports.filter(rapport =>
        rapport.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rapport.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const pageCount = Math.ceil(filteredRapports.length / itemsPerPage);
    const paginatedRapports = filteredRapports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Liste des Rapports</h1>
            
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher un rapport..."
                    className="form-control w-25"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={() => navigate('/user/UserCreateRapport')}
                className="btn btn-primary mb-4"
            >
                Ajouter un Rapport
            </button>
            <div className="mb-4">

            <button
                onClick={handleMassDelete}
                className="btn btn-danger mb-4"
                disabled={selectedRapports.length === 0}
            >
                Supprimer
            </button></div>

            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRapports(filteredRapports.map(rapport => rapport.id));
                                        } else {
                                            setSelectedRapports([]);
                                        }
                                    }}
                                    checked={selectedRapports.length === filteredRapports.length && filteredRapports.length > 0}
                                />
                            </th>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>DOI</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRapports.length ? (
                            paginatedRapports.map(rapport => (
                                <tr key={rapport.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRapports.includes(rapport.id)}
                                            onChange={() => handleSelectRapport(rapport.id)}
                                        />
                                    </td>
                                    <td>{rapport.title || 'Titre non disponible'}</td>
                                    <td>{rapport.author || 'Auteur non disponible'}</td>
                                    <td>
                                        {rapport.DOI ? (
                                            <a
                                                href={`https://doi.org/${rapport.DOI}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                    const isValidDOI = rapport.DOI.startsWith('10.');
                                                    if (!isValidDOI) {
                                                        e.preventDefault();
                                                        alert('Le DOI fourni semble invalide ou non trouvé. Vous pouvez essayer le lien PDF si disponible.');
                                                    }
                                                }}
                                            >
                                                {rapport.DOI}
                                            </a>
                                        ) : (
                                            'Pas de DOI disponible'
                                        )}
                                    </td>
                                    <td>{rapport.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <button
                                                onClick={() => handleEdit(rapport.id)}
                                                className="btn btn-primary mb-2"
                                            >
                                                <i className="bi bi-pencil"></i>
                                                </button>
                                            <button
                                                onClick={() => handleDelete(rapport.id)}
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
                                <td colSpan="6" className="text-center">Aucun rapport disponible</td>
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

export default UserRapport;
