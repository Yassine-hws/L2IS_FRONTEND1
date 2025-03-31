import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 

// Function to remove HTML tags
const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// Function to truncate text
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const PresentationAdmin = () => {
    const [presentations, setPresentations] = useState([]);
    const [teams, setTeams] = useState([]); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { accessToken } = useContext(AuthContext);
    const [expandedContent, setExpandedContent] = useState(null);
    const [expandedTitle, setExpandedTitle] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchPresentations();
        fetchTeams();
    }, [accessToken]);

    const fetchPresentations = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/presentations', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (Array.isArray(response.data)) {
                setPresentations(response.data);
            } else {
                throw new Error('Les données reçues ne sont pas un tableau');
            }
        } catch (error) {
            handleError(error, 'présentations');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/equipe', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (Array.isArray(response.data)) {
                setTeams(response.data);
            } else {
                throw new Error('Les données reçues ne sont pas un tableau');
            }
        } catch (error) {
            handleError(error, 'équipes');
        }
    };

    const handleError = (error, type) => {
        const errorMessage = error.response 
            ? (error.response.data.message || 'Erreur inconnue du serveur') + ' - Code: ' + error.response.status
            : error.message || 'Erreur inconnue';
        console.error(`Erreur lors de la récupération des ${type}`, errorMessage);
        setError(`Erreur lors de la récupération des ${type} : ${errorMessage}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette présentation ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/presentations/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setPresentations(prev => prev.filter(presentation => presentation.id !== id));
                toast.success('Présentation supprimée avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression de la présentation', error);
                toast.error('Erreur lors de la suppression de la présentation');
            }
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) {
            toast.warn('Aucune présentation sélectionnée');
            return;
        }

        if (window.confirm('Êtes-vous sûr de vouloir supprimer ces présentations ?')) {
            try {
                await Promise.all(selectedIds.map(id =>
                    axios.delete(`http://localhost:8000/api/presentations/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setPresentations(prev => prev.filter(presentation => !selectedIds.includes(presentation.id)));
                toast.success('Présentations supprimées avec succès');
                setSelectedIds([]);
            } catch (error) {
                console.error('Erreur lors de la suppression des présentations', error);
                toast.error('Erreur lors de la suppression des présentations');
            }
        }
    };

    const toggleExpandContent = (id) => {
        setExpandedContent(expandedContent === id ? null : id);
    };

    const toggleExpandTitle = (id) => {
        setExpandedTitle(expandedTitle === id ? null : id);
    };

    const getTeamNameById = (id) => {
        const team = teams.find(team => team.id === id);
        return team ? team.name : 'Inconnu';
    };

    const filteredPresentations = presentations.filter(presentation =>
        stripHtmlTags(presentation.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripHtmlTags(presentation.content).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Pagination Logic
    const indexOfLastPresentation = currentPage * itemsPerPage;
    const indexOfFirstPresentation = indexOfLastPresentation - itemsPerPage;
    const currentPresentations = filteredPresentations.slice(indexOfFirstPresentation, indexOfLastPresentation);

    // Calculate total pages
    const totalPages = Math.ceil(filteredPresentations.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion de la Présentation de l’Équipe</h1>
            {/* Search Bar */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher par titre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Link to="/dashboard/PresentationCreate" className="btn btn-primary mb-2">Ajouter une Présentation</Link>
            <div className="mb-4">
                <button 
                    onClick={handleBatchDelete} 
                    className="btn btn-danger mb-4"
                    disabled={selectedIds.length === 0}
                >
                    Supprimer 
                </button>
            </div>

            {error && <p className="text-danger">{error}</p>}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => setSelectedIds(e.target.checked ? presentations.map(p => p.id) : [])}
                                    />
                                </th>
                                <th scope="col">Titre</th>
                                <th scope="col">Contenu</th>
                                <th scope="col">Équipe</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPresentations.length ? (
                                currentPresentations.map(presentation => (
                                    <tr key={presentation.id}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(presentation.id)} 
                                                onChange={() => handleSelect(presentation.id)} 
                                            />
                                        </td>
                                        <td className="align-middle">
                                            {expandedTitle === presentation.id ? 
                                                stripHtmlTags(presentation.title) 
                                                : truncateText(stripHtmlTags(presentation.title), 30)}
                                        </td>
                                        <td className="align-middle">
                                            {expandedContent === presentation.id ? 
                                                stripHtmlTags(presentation.content) 
                                                : truncateText(stripHtmlTags(presentation.content), 50)}
                                            <button 
                                                onClick={() => toggleExpandContent(presentation.id)} 
                                                className="btn btn-link p-0 ml-2">
                                                {expandedContent === presentation.id ? 'Réduire' : 'Lire plus'}
                                            </button>
                                        </td>
                                        <td className="align-middle text-center">{getTeamNameById(presentation.team_id)}</td>
                                        <td  style={{ width: '80px' }}>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/PresentationEdit/${presentation.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(presentation.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">Aucune présentation disponible</td>
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
                    {[...Array(totalPages)].map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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

export default PresentationAdmin;

