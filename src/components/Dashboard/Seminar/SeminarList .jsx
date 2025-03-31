import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const SeminarList = () => {
    const [seminars, setSeminars] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const seminarsPerPage = 5;
    const [selectedSeminars, setSelectedSeminars] = useState([]);
    const { accessToken } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken) fetchSeminars();
    }, [accessToken]);

    const fetchSeminars = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/seminars', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            console.log("Data received from API:", response.data);
            setSeminars(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Fetch error:", error);
            setError('Erreur lors de la récupération des séminaires');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce séminaire ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/seminars/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setSeminars(seminars.filter(seminar => seminar.id !== id));
            } catch (error) {
                console.error("Delete error:", error);
                setError('Erreur lors de la suppression du séminaire');
            }
        }
    };

    const handleMassDelete = async () => {
        if (selectedSeminars.length === 0) {
            alert('Veuillez sélectionner au moins un séminaire à supprimer.');
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les séminaires sélectionnés ?')) {
            try {
                await Promise.all(
                    selectedSeminars.map(id =>
                        axios.delete(`http://localhost:8000/api/seminars/${id}`, {
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        })
                    )
                );
                setSeminars(seminars.filter(seminar => !selectedSeminars.includes(seminar.id)));
                setSelectedSeminars([]);
            } catch (error) {
                console.error("Mass delete error:", error);
                setError('Erreur lors de la suppression des séminaires');
            }
        }
    };

    const filteredSeminars = seminars.filter(seminar =>
        seminar.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.start_time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.end_time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentSeminars = filteredSeminars.slice((currentPage - 1) * seminarsPerPage, currentPage * seminarsPerPage);
    const totalPages = Math.ceil(filteredSeminars.length / seminarsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleSelectChange = (id) => {
        setSelectedSeminars(prevSelected =>
            prevSelected.includes(id) ? prevSelected.filter(s => s !== id) : [...prevSelected, id]
        );
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Séminaires</h1>
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    placeholder="Rechercher par titre, description, date, etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control w-25"
                />
            </div>
            <Link to="/dashboard/SeminarForm" className="btn btn-primary mb-2">Ajouter un Séminaire</Link>
           
            <div className="mb-4">
                <button 
                    onClick={handleMassDelete} 
                    className="btn btn-danger mb-4" 
                    disabled={selectedSeminars.length === 0}
                >
                    Supprimer
                </button>
                {error && <p className="text-danger">{error}</p>}
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={(e) => setSelectedSeminars(
                                        e.target.checked ? filteredSeminars.map(s => s.id) : []
                                    )}
                                    checked={selectedSeminars.length === filteredSeminars.length && filteredSeminars.length > 0}
                                />
                            </th>
                            <th>Titre</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Heure de Début</th>
                            <th>Heure de Fin</th>
                            <th>Lieu</th>
                            <th>Intervenant</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSeminars.length ? (
                            currentSeminars.map(seminar => (
                                <tr key={seminar.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedSeminars.includes(seminar.id)}
                                            onChange={() => handleSelectChange(seminar.id)}
                                        />
                                    </td>
                                    <td>{seminar.title}</td>
                                    <td>{seminar.description?.length > 100 
                                        ? `${seminar.description.substring(0, 100)}...` 
                                        : seminar.description}
                                    </td>
                                    <td>{seminar.date}</td>
                                    <td>{seminar.start_time}</td>
                                    <td>{seminar.end_time}</td>
                                    <td>{seminar.location}</td>
                                    <td>{seminar.speaker}</td>
                                    <td>{seminar.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <Link to={`/dashboard/SeminarDetails/${seminar.id}`} className="btn btn-primary mb-2">
                                                <i className="bi bi-pencil"></i>
                                            </Link>
                                            <button onClick={() => handleDelete(seminar.id)} className="btn btn-danger mb-2">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="text-center">Aucun séminaire disponible</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
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

export default SeminarList;
