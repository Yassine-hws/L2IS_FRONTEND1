import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const OuvrageAdmin = () => {
    const [ouvrages, setOuvrages] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedOuvrages, setSelectedOuvrages] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [date_publication, setDatePublication] = useState(new Date().toISOString().split('T')[0]);

    const { accessToken, currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken && currentUser) {
            fetchOuvrages();
        }
    }, [accessToken, currentUser]);

    const fetchOuvrages = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/ouvragesAdmin', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (Array.isArray(response.data)) {
                setOuvrages(response.data);
            } else {
                setError('Erreur de données');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des ouvrages');
        }
    };

    const pageCount = Math.ceil(ouvrages.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const offset = (currentPage - 1) * itemsPerPage;
    const currentOuvrages = ouvrages.slice(offset, offset + itemsPerPage);

    const handleSelect = (id) => {
        if (selectedOuvrages.includes(id)) {
            setSelectedOuvrages(selectedOuvrages.filter(ouvrageId => ouvrageId !== id));
        } else {
            setSelectedOuvrages([...selectedOuvrages, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les ouvrages sélectionnés ?')) {
            try {
                await Promise.all(selectedOuvrages.map(id => 
                    axios.delete(`http://localhost:8000/api/ouvrages/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setOuvrages(ouvrages.filter(ouvrage => !selectedOuvrages.includes(ouvrage.id)));
                setSelectedOuvrages([]);
            } catch (error) {
                setError("Erreur lors de la suppression des ouvrages");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ouvrage ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/ouvrages/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setOuvrages(ouvrages.filter(ouvrage => ouvrage.id !== id));
            } catch (error) {
                setError('Erreur lors de la suppression de l\'ouvrage');
            }
        }
    };

    // Filter ouvrages based on the search query
    const filteredOuvrages = ouvrages.filter(ouvrage =>
        ouvrage.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ouvrage.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ouvrage.DOI && ouvrage.DOI.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ouvrage.date_publication && ouvrage.date_publication.includes(searchQuery)) ||
        ouvrage.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Ouvrages</h1>
            
            {/* Search Bar */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25" // Adjust the width here
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Link to="/dashboard/OuvrageCreate" className="btn btn-primary mb-2">Ajouter un Ouvrage</Link>

            <div className="mb-4">
                <button className="btn btn-danger" onClick={handleBulkDelete} disabled={selectedOuvrages.length === 0}>
                    Supprimer
                </button>
            </div>
            {error && <p className="text-danger">{error}</p>}

            <table className="table table-bordered table-striped table-hover">
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
                        <th scope="col">Date de publication</th>
                        <th scope="col">Statut</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOuvrages.length ? (
                        filteredOuvrages.slice(offset, offset + itemsPerPage).map(ouvrage => (
                            <tr key={ouvrage.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedOuvrages.includes(ouvrage.id)}
                                        onChange={() => handleSelect(ouvrage.id)}
                                    />
                                </td>
                                <td>{ouvrage.title}</td>
                                <td>{ouvrage.author}</td>
                                <td>
                                    {ouvrage.DOI ? (
                                        <a href={`https://doi.org/${ouvrage.DOI}`} target="_blank" rel="noopener noreferrer">
                                            {ouvrage.DOI}
                                        </a>
                                    ) : (
                                        'Pas de DOI disponible'
                                    )}
                                </td>
                                <td>{ouvrage.date_publication ? new Date(ouvrage.date_publication).toLocaleDateString('fr-FR') : 'Non spécifiée'}</td>
                                <td>{ouvrage.status}</td>
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/OuvrageEdit/${ouvrage.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(ouvrage.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Aucun ouvrage disponible</td>
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

export default OuvrageAdmin;
