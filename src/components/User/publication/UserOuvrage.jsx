import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';

const UserOuvrage = () => {
    const [ouvrages, setOuvrages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOuvrages, setSelectedOuvrages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const ouvragesPerPage = 5;
    const navigate = useNavigate();
    const { currentUser, accessToken } = useContext(AuthContext);

    // Fetch ouvrages from API
    const fetchOuvrages = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/ouvrages/user-or-contributor/${currentUser.id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            setOuvrages(response.data);
        } catch (error) {
            toast.error('Erreur lors de la récupération des ouvrages');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOuvrages();
    }, [currentUser.id, accessToken]);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ouvrage ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/ouvragesUser/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                toast.success('Ouvrage supprimé avec succès');
                fetchOuvrages();
            } catch {
                toast.error("Erreur lors de la suppression de l'ouvrage");
            }
        }
    };

    const handleMassDelete = async () => {
        if (selectedOuvrages.length === 0) {
            alert("Veuillez sélectionner au moins un ouvrage.");
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les ouvrages sélectionnés ?')) {
            try {
                await Promise.all(selectedOuvrages.map(id =>
                    axios.delete(`http://localhost:8000/api/ouvragesUser/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                toast.success('Ouvrages supprimés avec succès');
                fetchOuvrages();
                setSelectedOuvrages([]);
            } catch {
                toast.error("Erreur lors de la suppression en masse");
            }
        }
    };

    const handleEdit = (id) => navigate(`/user/UserEditOuvrage/${id}`);

    const handleSelectOuvrage = (id) => {
        setSelectedOuvrages(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(selectedId => selectedId !== id)
                : [...prevSelected, id]
        );
    };

    const filteredOuvrages = ouvrages.filter(ouvrage =>
        ouvrage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ouvrage.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pageCount = Math.ceil(filteredOuvrages.length / ouvragesPerPage);
    const indexOfLastOuvrage = currentPage * ouvragesPerPage;
    const indexOfFirstOuvrage = indexOfLastOuvrage - ouvragesPerPage;
    const currentOuvrages = filteredOuvrages.slice(indexOfFirstOuvrage, indexOfLastOuvrage);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Liste des Ouvrages</h1>
            
            {/* Search and Add */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher un ouvrage..."
                    className="form-control w-25"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Link to="/user/UserCreateOuvrage" className="btn btn-primary">Ajouter un Ouvrage</Link>

            {/* Delete Selected */}
            <div className="mb-4">
                <button  className="btn btn-danger" onClick={handleMassDelete} disabled={selectedOuvrages.length === 0}>
                    Supprimer 
                </button>
            </div>

            {/* Loading Spinner */}
            {isLoading ? <p>Chargement des ouvrages...</p> : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedOuvrages(currentOuvrages.map(ouvrage => ouvrage.id));
                                            } else {
                                                setSelectedOuvrages([]);
                                            }
                                        }}
                                        checked={selectedOuvrages.length === currentOuvrages.length && currentOuvrages.length > 0}
                                    />
                                </th>
                                
                                <th scope="col">Titre</th>
                                <th scope="col">Auteur</th>
                                <th scope="col">DOI</th>
                                <th scope="col">Date de Publication</th> {/* Nouvelle colonne */}
                                <th scope="col">Statut</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOuvrages.length ? (
                                currentOuvrages.map(ouvrage => (
                                    <tr key={ouvrage.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOuvrages.includes(ouvrage.id)}
                                                onChange={() => handleSelectOuvrage(ouvrage.id)}
                                            />
                                        </td>
                                        <td>{ouvrage.title}</td>
                                        <td>{ouvrage.author}</td>
                                        <td>
                                            {ouvrage.DOI ? (
                                                <a href={`https://doi.org/${ouvrage.DOI}`} target="_blank" rel="noopener noreferrer">
                                                    {ouvrage.DOI}
                                                </a>
                                            ) : 'Pas de DOI disponible'}
                                        </td>
                                        <td>{ouvrage.date_publication ? new Date(ouvrage.date_publication).toLocaleDateString() : 'Non spécifiée'}</td> {/* Affichage de la date de publication */}
                                        <td>{ouvrage.status}</td>
                                        <td>
                                        <div className="d-flex justify-content-between">
                                            <button onClick={() => handleEdit(ouvrage.id)} className="btn btn-primary mb-2 ">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button onClick={() => handleDelete(ouvrage.id)} className="btn btn-danger mb-2">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">Aucun ouvrage disponible</td> {/* Ajusté pour la nouvelle colonne */}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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

export default UserOuvrage;
