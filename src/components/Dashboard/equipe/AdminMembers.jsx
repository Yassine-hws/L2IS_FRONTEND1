import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons

const MembreAdmin = () => {
    const [members, setMembers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [expandedBio, setExpandedBio] = useState({});
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { accessToken } = useContext(AuthContext);

    useEffect(() => {
        fetchMembers();
        fetchTeams();
    }, [accessToken]);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/members', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (Array.isArray(response.data)) {
                setMembers(response.data);
            } else {
                console.error('Les données reçues ne sont pas un tableau');
                setError('Erreur de données');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des membres', error);
            setError('Erreur lors de la récupération des membres');
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
                console.error('Les données reçues ne sont pas un tableau');
                setError('Erreur de données');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des équipes', error);
            setError('Erreur lors de la récupération des équipes');
        }
    };

    const getTeamNameById = (id) => {
        const team = teams.find(team => team.id === id);
        return team ? team.name : 'Inconnu';
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/members/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setMembers(members.filter(member => member.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression du membre', error);
                setError('Erreur lors de la suppression du membre');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les membres sélectionnés ?')) {
            try {
                await Promise.all(selectedMembers.map(id => 
                    axios.delete(`http://localhost:8000/api/members/${id}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    })
                ));
                setMembers(members.filter(member => !selectedMembers.includes(member.id)));
                setSelectedMembers([]);
            } catch (error) {
                console.error("Erreur lors de la suppression des membres", error);
                setError("Erreur lors de la suppression des membres");
            }
        }
    };

    const toggleBio = (id) => {
        setExpandedBio(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    // Filter members based on all attributes
    const filteredMembers = members.filter(member =>
        Object.values(member).some(val => 
            val && val.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    // Pagination logic
    const pageCount = Math.ceil(filteredMembers.length / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    const currentMembers = filteredMembers.slice(offset, offset + itemsPerPage);

    return (
        <div className="container">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Membres</h1>
           
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Link to="/dashboard/MembreCreate" className="btn btn-primary mb-2">Ajouter un Membre</Link>
            <div className="mb-4">
                <button className="btn btn-danger mb-4" onClick={handleBulkDelete} disabled={selectedMembers.length === 0}>
                    Supprimer
                </button>
            </div>
          
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMembers(currentMembers.map(member => member.id));
                                        } else {
                                            setSelectedMembers([]);
                                        }
                                    }}
                                    checked={selectedMembers.length === currentMembers.length && currentMembers.length > 0}
                                />
                            </th>
                            <th scope="col">Image</th>
                            <th scope="col">Nom</th>
                            <th scope="col">Poste</th>
                            <th scope="col">Bio</th>
                            <th scope="col">Infos de Contact</th>
                            <th scope="col">Équipe</th>
                            <th scope="col">Statut</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentMembers.length ? (
                            currentMembers.map(member => (
                                <tr key={member.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.id)}
                                            onChange={() => {
                                                if (selectedMembers.includes(member.id)) {
                                                    setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                                                } else {
                                                    setSelectedMembers([...selectedMembers, member.id]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        {member.image ? (
                                            <img src={`http://localhost:8000/storage/${member.image}`} alt={member.name} className="img-thumbnail" style={{ width: '60px', height: '60px' }} />
                                        ) : (
                                            <div className="bg-secondary rounded-circle" style={{ width: '60px', height: '60px' }}></div>
                                        )}
                                    </td>
                                    <td>{member.name}</td>
                                    <td>{member.position}</td>
                                    <td>
                                        <div>
                                            {expandedBio[member.id] 
                                                ? member.bio 
                                                : `${member.bio.substring(0, 50)}...`}
                                            {member.bio.length > 50 && (
                                                <span 
                                                    onClick={() => toggleBio(member.id)} 
                                                    className="text-primary cursor-pointer ml-1">
                                                    {expandedBio[member.id] ? 'Lire moins' : 'Lire suite'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{member.contact_info}</td>
                                    <td>{getTeamNameById(member.team_id)}</td>
                                    <td>{member.statut}</td>
                                    <td>
                                        <Link to={`/dashboard/MembreEdit/${member.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i> {/* Edit icon */}
                                        </Link>
                                        <button onClick={() => handleDelete(member.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i> {/* Delete icon */}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">Aucun membre disponible</td>
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

export default MembreAdmin;
