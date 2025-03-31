import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import { toast } from 'react-toastify';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Import icons

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

const AdminAxes = () => {
    const [axes, setAxes] = useState([]);
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState('');
    const { accessToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true); // Loading state
    const [expandedContent, setExpandedContent] = useState(null); // State for expanded content
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [selectedIds, setSelectedIds] = useState([]); // State for selected axes

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchAxes();
        fetchTeams();
    }, [accessToken]);

    const fetchAxes = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get('http://localhost:8000/api/axes', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (Array.isArray(response.data)) {
                setAxes(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau', response.data);
                setError('Erreur de données : Les données reçues ne sont pas un tableau');
            }
        } catch (error) {
            const errorMessage = error.response 
                ? (error.response.data.message || 'Erreur inconnue du serveur') + ' - Code: ' + error.response.status
                : error.message || 'Erreur inconnue';
            console.error('Erreur lors de la récupération des axes', errorMessage);
            setError('Erreur lors de la récupération des axes : ' + errorMessage);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/equipe', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (Array.isArray(response.data)) {
                setTeams(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau', response.data);
                setError('Erreur de données : Les données reçues ne sont pas un tableau');
            }
        } catch (error) {
            const errorMessage = error.response 
                ? (error.response.data.message || 'Erreur inconnue du serveur') + ' - Code: ' + error.response.status
                : error.message || 'Erreur inconnue';
            console.error('Erreur lors de la récupération des équipes', errorMessage);
            setError('Erreur lors de la récupération des équipes : ' + errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet axe ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/axes/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setAxes(axes.filter(axe => axe.id !== id));
                toast.success('Axe supprimé avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'axe', error);
                toast.error('Erreur lors de la suppression de l\'axe');
            }
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) {
            toast.warn('Aucun axe sélectionné');
            return;
        }
        
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ces axes ?')) {
            try {
                await Promise.all(selectedIds.map(id =>
                    axios.delete(`http://localhost:8000/api/axes/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                setAxes(axes.filter(axe => !selectedIds.includes(axe.id)));
                toast.success('Axes supprimés avec succès');
                setSelectedIds([]); // Reset selected IDs
            } catch (error) {
                console.error('Erreur lors de la suppression des axes', error);
                toast.error('Erreur lors de la suppression des axes');
            }
        }
    };

    const toggleExpandContent = (id) => {
        setExpandedContent(expandedContent === id ? null : id);
    };

    // Function to get team name by ID
    const getTeamNameById = (id) => {
        const team = teams.find(team => team.id === id);
        return team ? team.name : 'Inconnu';
    };

    // Filter axes based on search query
    const filteredAxes = axes.filter(axe =>
        stripHtmlTags(axe.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripHtmlTags(axe.content).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id) => {
        setSelectedIds((prevSelected) => 
            prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
        );
    };

    // Pagination Logic
    const indexOfLastAxe = currentPage * itemsPerPage;
    const indexOfFirstAxe = indexOfLastAxe - itemsPerPage;
    const currentAxes = filteredAxes.slice(indexOfFirstAxe, indexOfLastAxe);

    // Calculate total pages
    const totalPages = Math.ceil(filteredAxes.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Axes de Recherche</h1>
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
            <Link to="/dashboard/AxeCreate" className="btn btn-primary mb-2">Ajouter un Axe</Link>
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
                <p>Loading...</p> // Show loading indicator
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => setSelectedIds(e.target.checked ? axes.map(a => a.id) : [])}
                                    />
                                </th>
                                <th scope="col">Titre</th>
                                <th scope="col">Description</th>
                                <th scope="col">Équipe</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAxes.length ? (
                                currentAxes.map(axe => (
                                    <tr key={axe.id}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(axe.id)} 
                                                onChange={() => handleSelect(axe.id)} 
                                            />
                                        </td>
                                        <td className="align-middle">
                                            {stripHtmlTags(axe.title)}
                                        </td>
                                        <td className="align-middle">
                                            {expandedContent === axe.id ? 
                                                stripHtmlTags(axe.content) 
                                                : truncateText(stripHtmlTags(axe.content), 80)}
                                            <button 
                                                onClick={() => toggleExpandContent(axe.id)} 
                                                className="btn btn-link p-0 ml-2">
                                                {expandedContent === axe.id ? 'Réduire' : 'Lire plus'}
                                            </button>
                                        </td>
                                        <td className="align-middle text-center">{getTeamNameById(axe.team_id)}</td>
                                        <td  style={{ width: '80px' }}>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/AxeEdit/${axe.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(axe.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">Aucun axe disponible</td>
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

export default AdminAxes;
