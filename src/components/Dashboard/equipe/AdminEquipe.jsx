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

const EquipeAdmin = () => {
    const [equipes, setEquipes] = useState([]);
    const [error, setError] = useState('');
    const { accessToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true); // Loading state
    const [expandedDescription, setExpandedDescription] = useState({}); // State for expanded descriptions
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [selectedIds, setSelectedIds] = useState([]); // State for selected teams

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchEquipes();
    }, [accessToken]);

    const fetchEquipes = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get('http://localhost:8000/api/equipe', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (Array.isArray(response.data)) {
                setEquipes(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau');
                setError('Erreur de données : Les données reçues ne sont pas un tableau');
            }
        } catch (error) {
            const errorMessage = error.response 
                ? (error.response.data.message || 'Erreur inconnue du serveur') + ' - Code: ' + error.response.status
                : error.message || 'Erreur inconnue';
            console.error('Erreur lors de la récupération des équipes', errorMessage);
            setError('Erreur lors de la récupération des équipes : ' + errorMessage);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/equipe/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setEquipes(equipes.filter(equipe => equipe.id !== id));
                toast.success('Équipe supprimée avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'équipe', error);
                toast.error('Erreur lors de la suppression de l\'équipe');
            }
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) {
            toast.warn('Aucune équipe sélectionnée');
            return;
        }

        if (window.confirm('Êtes-vous sûr de vouloir supprimer ces équipes ?')) {
            try {
                await Promise.all(selectedIds.map(id =>
                    axios.delete(`http://localhost:8000/api/equipe/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                setEquipes(equipes.filter(equipe => !selectedIds.includes(equipe.id)));
                toast.success('Équipes supprimées avec succès');
                setSelectedIds([]); // Reset selected IDs
            } catch (error) {
                console.error('Erreur lors de la suppression des équipes', error);
                toast.error('Erreur lors de la suppression des équipes');
            }
        }
    };

    const toggleDescription = (id) => {
        setExpandedDescription(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    // Filter equipes based on search query
    const filteredEquipes = equipes.filter(equipe =>
        stripHtmlTags(equipe.name).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id) => {
        setSelectedIds((prevSelected) => 
            prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
        );
    };

    // Pagination Logic
    const indexOfLastEquipe = currentPage * itemsPerPage;
    const indexOfFirstEquipe = indexOfLastEquipe - itemsPerPage;
    const currentEquipes = filteredEquipes.slice(indexOfFirstEquipe, indexOfLastEquipe);

    // Calculate total pages
    const totalPages = Math.ceil(filteredEquipes.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Équipes</h1>
            {/* Search Bar */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Link to="/dashboard/EquipeCreate" className="btn btn-primary mb-2">Ajouter une Équipe</Link>
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
                                        onChange={(e) => setSelectedIds(e.target.checked ? equipes.map(e => e.id) : [])}
                                    />
                                </th>
                                <th scope="col">Nom</th>
                                <th scope="col">Spécialisation</th>
                                <th scope="col">Description</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEquipes.length ? (
                                currentEquipes.map(equipe => (
                                    <tr key={equipe.id}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(equipe.id)} 
                                                onChange={() => handleSelect(equipe.id)} 
                                            />
                                        </td>
                                        <td>{equipe.name}</td>
                                        <td>{equipe.specialization}</td>
                                        <td>
                                            <div>
                                                {expandedDescription[equipe.id] 
                                                    ? stripHtmlTags(equipe.description) // Display full text
                                                    : truncateText(stripHtmlTags(equipe.description), 50)} {/* Display truncated text */}
                                                {stripHtmlTags(equipe.description).length > 50 && (
                                                    <button 
                                                        className="btn btn-link p-0 ml-2" 
                                                        onClick={() => toggleDescription(equipe.id)}>
                                                        {expandedDescription[equipe.id] ? 'Lire moins' : 'Lire suite'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td  style={{ width: '80px' }}>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/EquipeEdit/${equipe.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(equipe.id)} className="btn btn-danger mb-2 me-1">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">Aucune équipe disponible</td>
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

export default EquipeAdmin;
