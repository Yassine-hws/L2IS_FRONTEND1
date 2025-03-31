import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import { toast } from 'react-toastify';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons

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

// Function to truncate title
const truncateTitle = (title, maxLength) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
};

const NewsAdmin = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [error, setError] = useState('');
    const { accessToken } = useContext(AuthContext);
    const [expanded, setExpanded] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedNews, setSelectedNews] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchNews();
    }, [accessToken]);

    const fetchNews = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/news', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (Array.isArray(response.data)) {
                setNewsItems(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau', response.data);
                setError('Erreur de données : Les données reçues ne sont pas un tableau');
            }
        } catch (error) {
            const errorMessage = error.response 
                ? (error.response.data.message || 'Erreur inconnue du serveur') + ' - Code: ' + error.response.status
                : error.message || 'Erreur inconnue';
            console.error('Erreur lors de la récupération des actualités', errorMessage);
            setError('Erreur lors de la récupération des actualités : ' + errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/news/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setNewsItems(newsItems.filter(news => news.id !== id));
                toast.success('Actualité supprimée avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'actualité', error);
                toast.error('Erreur lors de la suppression de l\'actualité');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les actualités sélectionnées ?')) {
            try {
                await Promise.all(selectedNews.map(id => 
                    axios.delete(`http://localhost:8000/api/news/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setNewsItems(newsItems.filter(news => !selectedNews.includes(news.id)));
                setSelectedNews([]);
                toast.success('Actualités supprimées avec succès');
            } catch (error) {
                console.error('Erreur lors de la suppression des actualités', error);
                toast.error('Erreur lors de la suppression des actualités');
            }
        }
    };

    const toggleExpand = (id) => {
        setExpanded(expanded === id ? null : id);
    };

    // Filter news items based on the search query
    const filteredNewsItems = newsItems.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const pageCount = Math.ceil(filteredNewsItems.length / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    const currentNewsItems = filteredNewsItems.slice(offset, offset + itemsPerPage);

    return (
        <div className="container">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Actualités</h1>
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Link to="/dashboard/NewsCreate" className="btn btn-primary mb-2">Ajouter une Actualité</Link>
           
            <div className="mb-4">
                <button className="btn btn-danger" onClick={handleBulkDelete} disabled={selectedNews.length === 0}>
                    Supprimer
                </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedNews(currentNewsItems.map(news => news.id));
                                        } else {
                                            setSelectedNews([]);
                                        }
                                    }}
                                    checked={selectedNews.length === currentNewsItems.length && currentNewsItems.length > 0}
                                />
                            </th>
                            <th>Titre</th>
                            <th>Contenu</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentNewsItems.length ? (
                            currentNewsItems.map(news => (
                                <tr key={news.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedNews.includes(news.id)}
                                            onChange={() => {
                                                if (selectedNews.includes(news.id)) {
                                                    setSelectedNews(selectedNews.filter(id => id !== news.id));
                                                } else {
                                                    setSelectedNews([...selectedNews, news.id]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        {truncateTitle(news.title, 50)}
                                    </td>
                                    <td>
                                        {expanded === news.id ? 
                                            stripHtmlTags(news.content) 
                                            : truncateText(stripHtmlTags(news.content), 50)}
                                        <button onClick={() => toggleExpand(news.id)} className="btn btn-link">
                                            {expanded === news.id ? 'Réduire' : 'Lire plus'}
                                        </button>
                                    </td>
                                    <td>
                                        {news.image ? (
                                            <img
                                                src={`http://localhost:8000/storage/${news.image}`}
                                                alt={news.title}
                                                style={{ width: '100px', height: 'auto' }}
                                            />
                                        ) : (
                                            'Pas d\'image'
                                        )}
                                    </td>
                                    <td>
                                        <Link to={`/dashboard/NewsEdit/${news.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i> {/* Edit icon */}
                                        </Link>
                                        <button onClick={() => handleDelete(news.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i> {/* Delete icon */}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Aucune actualité disponible</td>
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
                            onClick={() => setCurrentPage(currentPage - 1)} 
                            aria-label="Previous"
                        >
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    {[...Array(pageCount)].map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                        <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(currentPage + 1)} 
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

export default NewsAdmin;
