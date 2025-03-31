import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const ConferenceAdmin = () => {
    const [conferences, setConferences] = useState([]);
    const [filteredConferences, setFilteredConferences] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConferences, setSelectedConferences] = useState([]);
    const { accessToken } = useContext(AuthContext);

    const [currentPage, setCurrentPage] = useState(1);
    const conferencesPerPage = 5;

    useEffect(() => {
        if (accessToken) {
            fetchConferences();
        }
    }, [accessToken]);

    const fetchConferences = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/conferences', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (Array.isArray(response.data)) {
                setConferences(response.data);
                setFilteredConferences(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau');
                setError('Erreur de données');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des conférences', error);
            setError('Erreur lors de la récupération des conférences');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conférence ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/conferences/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                setConferences(conferences.filter(conference => conference.id !== id));
                setFilteredConferences(filteredConferences.filter(conference => conference.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression de la conférence', error);
                setError('Erreur lors de la suppression de la conférence');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedConferences.length > 0 && window.confirm('Êtes-vous sûr de vouloir supprimer les conférences sélectionnées ?')) {
            try {
                await Promise.all(selectedConferences.map(id => axios.delete(`http://localhost:8000/api/conferences/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                })));
                const updatedConferences = conferences.filter(conference => !selectedConferences.includes(conference.id));
                setConferences(updatedConferences);
                setFilteredConferences(updatedConferences);
                setSelectedConferences([]);
            } catch (error) {
                console.error('Erreur lors de la suppression en masse des conférences', error);
                setError('Erreur lors de la suppression en masse des conférences');
            }
        }
    };

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchQuery(term);
        const filtered = conferences.filter(conference =>
            conference.title.toLowerCase().includes(term) ||
            conference.date.toLowerCase().includes(term) ||
            conference.location.toLowerCase().includes(term)
        );
        setFilteredConferences(filtered);
        setCurrentPage(1);
    };

    const handleCheckboxChange = (id) => {
        setSelectedConferences(prevSelected =>
            prevSelected.includes(id) ? prevSelected.filter(confId => confId !== id) : [...prevSelected, id]
        );
    };

    const indexOfLastConference = currentPage * conferencesPerPage;
    const indexOfFirstConference = indexOfLastConference - conferencesPerPage;
    const currentConferences = filteredConferences.slice(indexOfFirstConference, indexOfLastConference);

    const pageCount = Math.ceil(filteredConferences.length / conferencesPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= pageCount) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Conférences</h1>

            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher par titre, date ou lieu..."
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>
            <Link to="/dashboard/ConferenceCreate" className="btn btn-primary mb-4">Ajouter une Conférence</Link>

            <div className="mb-4">
                <button 
                    className="btn btn-danger" 
                    onClick={handleBulkDelete} 
                    disabled={selectedConferences.length === 0}
                >
                    Supprimer
                </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedConferences(filteredConferences.map(conference => conference.id));
                                        } else {
                                            setSelectedConferences([]);
                                        }
                                    }}
                                    checked={selectedConferences.length === filteredConferences.length && filteredConferences.length > 0}
                                />
                            </th>
                            <th scope="col">Image</th>
                            <th scope="col">Titre</th>
                            <th scope="col">Date</th>
                            <th scope="col">Lieu</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentConferences.length > 0 ? (
                            currentConferences.map(conference => (
                                <tr key={conference.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedConferences.includes(conference.id)}
                                            onChange={() => handleCheckboxChange(conference.id)}
                                        />
                                    </td>
                                    <td>
                                        {conference.image ? (
                                            <img
                                                src={`http://localhost:8000/storage/${conference.image}`}
                                                alt={conference.title}
                                                className="img-thumbnail"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            'Pas d\'image disponible'
                                        )}
                                    </td>
                                    <td>{conference.title}</td>
                                    <td>{conference.date}</td>
                                    <td>{conference.location}</td>
                                   <td  style={{ width: '60px' }}>
    <div className="d-flex gap-2">
        <Link to={`/dashboard/ConferenceEdit/${conference.id}`} className="btn btn-primary mb-2 me-2">
            <i className="bi bi-pencil"></i>
        </Link>
        <button onClick={() => handleDelete(conference.id)} className="btn btn-danger mb-2">
            <i className="bi bi-trash"></i>
        </button>
    </div>
</td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">Aucune conférence disponible</td>
                            </tr>
                        )}
                    </tbody>
                </table>

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
        </div>
    );
};

export default ConferenceAdmin;
