import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const ReportAdmin = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedReports, setSelectedReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { accessToken, currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (accessToken && currentUser) {
            fetchReports();
        }
    }, [accessToken, currentUser]);

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/reportsAdmin', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (Array.isArray(response.data)) {
                setReports(response.data);
            } else {
                setError('Erreur de données');
            }
        } catch (error) {
            setError('Erreur lors de la récupération des rapports');
        }
    };

    const pageCount = Math.ceil(reports.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const offset = (currentPage - 1) * itemsPerPage;
    const currentReports = reports.slice(offset, offset + itemsPerPage);

    const handleSelect = (id) => {
        if (selectedReports.includes(id)) {
            setSelectedReports(selectedReports.filter(reportId => reportId !== id));
        } else {
            setSelectedReports([...selectedReports, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les rapports sélectionnés ?')) {
            try {
                await Promise.all(selectedReports.map(id => 
                    axios.delete(`http://localhost:8000/api/reports/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setReports(reports.filter(report => !selectedReports.includes(report.id)));
                setSelectedReports([]);
            } catch (error) {
                setError("Erreur lors de la suppression des rapports");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/reports/${id}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });
                setReports(reports.filter(report => report.id !== id));
            } catch (error) {
                setError('Erreur lors de la suppression du rapport');
            }
        }
    };

    // Filter reports based on the search query
    const filteredReports = reports.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.DOI?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.date_publication && report.date_publication.includes(searchQuery)) ||
        report.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Rapports</h1>

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

            <Link to="/dashboard/ReportCreate" className="btn btn-primary mb-2">Ajouter un Rapport</Link>

            <div className="mb-4">
                <button className="btn btn-danger" onClick={handleBulkDelete} disabled={selectedReports.length === 0}>
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
                                        setSelectedReports(currentReports.map(report => report.id));
                                    } else {
                                        setSelectedReports([]);
                                    }
                                }}
                                checked={selectedReports.length === currentReports.length && currentReports.length > 0}
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
                    {filteredReports.length ? (
                        filteredReports.slice(offset, offset + itemsPerPage).map(report => (
                            <tr key={report.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedReports.includes(report.id)}
                                        onChange={() => handleSelect(report.id)}
                                    />
                                </td>
                                <td>{report.title}</td>
                                <td>{report.author}</td>
                                <td>
                                    {report.DOI ? (
                                        <a href={`https://doi.org/${report.DOI}`} target="_blank" rel="noopener noreferrer">
                                            {report.DOI}
                                        </a>
                                    ) : (
                                        'Pas de DOI disponible'
                                    )}
                                </td>
                                <td>{report.date_publication ? new Date(report.date_publication).toLocaleDateString('fr-FR') : 'Non spécifiée'}</td>
                                <td>{report.status}</td>
                                <td>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/ReportEdit/${report.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(report.id)} className="btn btn-danger mb-2">
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

export default ReportAdmin;
