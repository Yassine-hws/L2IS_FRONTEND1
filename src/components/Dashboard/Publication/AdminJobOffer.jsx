import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const JobOfferAdmin = () => {
    const [jobOffers, setJobOffers] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // État pour la barre de recherche
    const [selectedOffers, setSelectedOffers] = useState([]); // État pour les offres sélectionnées
    const [expandedDescription, setExpandedDescription] = useState({}); // État pour les descriptions étendues
    const { accessToken } = useContext(AuthContext);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [offersPerPage] = useState(5); // Changez ceci en fonction du nombre d'offres par page
    const pageCount = Math.ceil(jobOffers.length / offersPerPage); // Définir le nombre total de pages

    useEffect(() => {
        fetchJobOffers();
    }, [accessToken]);

    const fetchJobOffers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/job-offers', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (Array.isArray(response.data)) {
                setJobOffers(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau');
                setError('Erreur de données');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des offres d\'emploi', error);
            setError('Erreur lors de la récupération des offres d\'emploi');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre d\'emploi ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/job-offers/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setJobOffers(jobOffers.filter(jobOffer => jobOffer.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'offre d\'emploi', error);
                setError('Erreur lors de la suppression de l\'offre d\'emploi');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedOffers.length === 0) {
            alert('Aucune offre sélectionnée.');
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ces offres d\'emploi ?')) {
            try {
                await Promise.all(selectedOffers.map(id =>
                    axios.delete(`http://localhost:8000/api/job-offers/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                setJobOffers(jobOffers.filter(jobOffer => !selectedOffers.includes(jobOffer.id)));
                setSelectedOffers([]); // Réinitialiser la sélection après la suppression
            } catch (error) {
                console.error('Erreur lors de la suppression des offres d\'emploi', error);
                setError('Erreur lors de la suppression des offres d\'emploi');
            }
        }
    };

    const handleSelectOffer = (id) => {
        setSelectedOffers(prev => 
            prev.includes(id) ? prev.filter(offerId => offerId !== id) : [...prev, id]
        );
    };

    const truncateText = (text, length) => {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    const formatSalary = (salary) => {
        const numSalary = parseFloat(salary);
        return !isNaN(numSalary) ? numSalary.toFixed(2) : 'N/A';
    };

    // Filtrer les offres d'emploi selon la recherche sur tous les attributs
    const filteredJobOffers = jobOffers.filter(jobOffer =>
        jobOffer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobOffer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobOffer.requirements.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobOffer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobOffer.salary.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculer les offres actuelles à afficher
    const indexOfLastOffer = currentPage * offersPerPage;
    const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
    const currentOffers = filteredJobOffers.slice(indexOfFirstOffer, indexOfLastOffer);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const toggleExpandDescription = (id) => {
        setExpandedDescription(prev => ({
            ...prev,
            [id]: !prev[id] // Basculer l'état étendu
        }));
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Appel à Inscription</h1>
            
            {/* Barre de recherche */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher par titre, description, exigences, lieu ou salaire..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <Link to="/dashboard/JobOfferCreate" className="btn btn-primary mb-2">Ajouter une Offre</Link>
            <div className="mb-4">
                <button 
                    onClick={handleBulkDelete} 
                    className="btn btn-danger mb-2"
                    disabled={selectedOffers.length === 0} // Désactiver le bouton si aucune offre sélectionnée
                >
                    Supprimer
                </button>
            </div>
            {error && <p className="alert alert-danger">{error}</p>}
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">
                            <input
                                type="checkbox"
                                checked={selectedOffers.length === currentOffers.length && currentOffers.length > 0}
                                onChange={() => {
                                    if (selectedOffers.length === currentOffers.length) {
                                        setSelectedOffers([]);
                                    } else {
                                        setSelectedOffers(currentOffers.map(jobOffer => jobOffer.id));
                                    }
                                }}
                            />
                        </th>
                        <th scope="col">Titre</th>
                        <th scope="col">Description</th>
                        <th scope="col">Exigences</th>
                        <th scope="col">Lieu</th>
                        <th scope="col">Salaire</th>
                        <th scope="col">Date Limite</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOffers.length ? (
                        currentOffers.map(jobOffer => (
                            <tr key={jobOffer.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedOffers.includes(jobOffer.id)}
                                        onChange={() => handleSelectOffer(jobOffer.id)}
                                    />
                                </td>
                                <td>{jobOffer.title}</td>
                                <td>
                                    {expandedDescription[jobOffer.id] ? jobOffer.description : truncateText(jobOffer.description, 20)}
                                    {jobOffer.description.length > 20 && (
                                        <span 
                                            onClick={() => toggleExpandDescription(jobOffer.id)} 
                                            className="text-primary cursor-pointer ml-1">Lire la suite</span>
                                    )}
                                </td>
                                <td>{truncateText(jobOffer.requirements, 20)}</td>
                                <td>{truncateText(jobOffer.location, 20)}</td>
                                <td>{formatSalary(jobOffer.salary)}</td>
                                <td>{new Date(jobOffer.deadline).toLocaleDateString()}</td>
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/JobOfferEdit/${jobOffer.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(jobOffer.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">Aucune offre d'emploi disponible</td>
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

export default JobOfferAdmin;
