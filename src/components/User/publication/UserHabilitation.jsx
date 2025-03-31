import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';
import { useNavigate } from 'react-router-dom';

const HabilitationUser = () => {
    const [habilitations, setHabilitations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHabilitations, setSelectedHabilitations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const { accessToken, currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fonction pour récupérer les habilitations
    const fetchHabilitations = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/habilitations/user-or-contributor/${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setHabilitations(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des habilitations:', error);
            toast.error('Erreur lors de la récupération des habilitations');
        }
    };

    useEffect(() => {
        fetchHabilitations();
    }, [accessToken]);

    // Suppression d'une seule habilitation
    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette habilitation ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/habilitationsUser/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                toast.success('Habilitation supprimée avec succès');
                fetchHabilitations();
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'habilitation:', error);
                toast.error('Erreur lors de la suppression de l\'habilitation');
            }
        }
    };

    // Suppression en masse des habilitations sélectionnées
    const handleMassDelete = async () => {
        if (selectedHabilitations.length === 0) {
            alert("Veuillez sélectionner au moins une habilitation.");
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les habilitations sélectionnées ?')) {
            try {
                await Promise.all(selectedHabilitations.map(id =>
                    axios.delete(`http://localhost:8000/api/habilitationsUser/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                toast.success('Habilitations supprimées avec succès');
                fetchHabilitations();
                setSelectedHabilitations([]);
            } catch (error) {
                console.error("Erreur lors de la suppression en masse:", error);
                toast.error("Erreur lors de la suppression en masse");
            }
        }
    };

    const handleEdit = (id) => {
        navigate(`/user/UserEditHabilitation/${id}`);
    };

    const handleSelectHabilitation = (id) => {
        setSelectedHabilitations(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    // Filtrer les habilitations selon le terme de recherche
    const filteredHabilitations = habilitations.filter(habilitation =>
        habilitation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habilitation.author?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const pageCount = Math.ceil(filteredHabilitations.length / itemsPerPage);
    const paginatedHabilitations = filteredHabilitations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Liste des Habilitations</h1>
            
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher une habilitation..."
                    className="form-control w-25"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={() => navigate('/user/UserCreateHabilitation')}
                className="btn btn-primary mb-4"
            >
                Ajouter une Habilitation
            </button>
            <div className="mb-4">
                <button
                    onClick={handleMassDelete}
                    className="btn btn-danger mb-4"
                    disabled={selectedHabilitations.length === 0}
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
                                            setSelectedHabilitations(filteredHabilitations.map(habilitation => habilitation.id));
                                        } else {
                                            setSelectedHabilitations([]);
                                        }
                                    }}
                                    checked={selectedHabilitations.length === filteredHabilitations.length && filteredHabilitations.length > 0}
                                />
                            </th>
                            <th>Titre</th>
                            <th>Auteur(s)</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedHabilitations.length ? (
                            paginatedHabilitations.map(habilitation => (
                                <tr key={habilitation.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedHabilitations.includes(habilitation.id)}
                                            onChange={() => handleSelectHabilitation(habilitation.id)}
                                        />
                                    </td>
                                    <td>{habilitation.title || 'Titre non disponible'}</td>
                                    <td>{habilitation.author || 'Auteur non disponible'}</td>
                                    <td>{habilitation.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <button
                                                onClick={() => handleEdit(habilitation.id)}
                                                className="btn btn-primary mb-2"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(habilitation.id)}
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
                                <td colSpan="5" className="text-center">Aucune habilitation trouvée</td>
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

export default HabilitationUser;
