import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';

const ProjectsAdmin = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [error, setError] = useState('');
    const { accessToken } = useContext(AuthContext);
    
    // State to track expanded titles and descriptions
    const [expandedTitle, setExpandedTitle] = useState({});
    const [expandedDescription, setExpandedDescription] = useState({});
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(10); // Adjust this value as needed
    const [selectedProjects, setSelectedProjects] = useState([]);

    useEffect(() => {
        fetchProjects();
    }, [accessToken]);

    useEffect(() => {
        setFilteredProjects(projects);
    }, [projects]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/projects', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des projets', error);
            setError('Erreur lors de la récupération des projets');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/projects/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setProjects(projects.filter(project => project.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression du projet', error);
                setError('Erreur lors de la suppression du projet');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les projets sélectionnés ?')) {
            try {
                await Promise.all(selectedProjects.map(id => 
                    axios.delete(`http://localhost:8000/api/projects/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                setProjects(projects.filter(project => !selectedProjects.includes(project.id)));
                setSelectedProjects([]);
            } catch (error) {
                console.error('Erreur lors de la suppression en masse des projets', error);
                setError('Erreur lors de la suppression en masse des projets');
            }
        }
    };

    const handleSelectProject = (id) => {
        setSelectedProjects(prevState =>
            prevState.includes(id) ? prevState.filter(item => item !== id) : [...prevState, id]
        );
    };

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();

        const filtered = projects.filter(project =>
            Object.values(project).some(value =>
                value && value.toString().toLowerCase().includes(searchTerm)
            )
        );

        setFilteredProjects(filtered);
        setCurrentPage(1); // Reset to first page on search
    };

    // Pagination logic
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const pageCount = Math.ceil(filteredProjects.length / projectsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const toggleExpandDescription = (id) => {
        setExpandedDescription(prevState => ({
            ...prevState,
            [id]: !prevState[id] // Toggle the expanded state for the specific project description
        }));
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gérer les Projets</h1>
            <div className="mb-4 d-flex justify-content-end">

            <input 
                type="text" 
                placeholder="Rechercher..." 
                className="form-control w-25"
                onChange={handleSearch} 
            />
            </div>
            
            <Link to="/dashboard/ProjectsCreate" className="btn btn-primary mb-2">Ajouter un Projet</Link>
            <div className="mb-4">

            <button 
                className="btn btn-danger mb-4" 
                onClick={handleBulkDelete} 
                disabled={selectedProjects.length === 0}
            >
                Supprimer 
            </button>
            </div>
            {error && <p className="text-danger">{error}</p>}
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Titre</th>
                            <th scope="col">Description</th>
                            <th scope="col">Équipe</th>
                            <th scope="col">Date de début</th>
                            <th scope="col">Date de fin</th>
                            <th scope="col">Type de financement</th>
                            <th scope="col">Statut</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProjects.length ? (
                            currentProjects.map(project => (
                                <tr key={project.id}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedProjects.includes(project.id)} 
                                            onChange={() => handleSelectProject(project.id)} 
                                        />
                                    </td>
                                    <td>{project.title}</td>
                                    <td>
                                        {expandedDescription[project.id] ? project.description : project.description.substring(0, 40) + '...'}
                                        {project.description.length > 40 && !expandedDescription[project.id] && (
                                            <span 
                                                onClick={() => toggleExpandDescription(project.id)} 
                                                className="text-primary cursor-pointer ml-1">
                                                Lire la suite
                                            </span>
                                        )}
                                    </td>
                                    <td>{project.team}</td>
                                    <td>{project.start_date}</td>
                                    <td>{project.end_date}</td>
                                    <td>{project.funding_type}</td>
                                    <td>{project.status}</td>
                                    <td>
                                        <div className="d-flex justify-content-between">
                                            <Link to={`/dashboard/ProjectsEdit/${project.id}`}  className="btn btn-primary mb-2">
                                                <i className="bi bi-pencil"></i>
                                            </Link>
                                            <button onClick={() => handleDelete(project.id)}  className="btn btn-danger mb-2">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">Aucun projet disponible</td>
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

export default ProjectsAdmin;
