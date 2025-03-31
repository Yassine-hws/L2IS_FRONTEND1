import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import { toast } from 'react-toastify';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 

const AdminUtilisateur = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [error, setError] = useState('');
    const { accessToken } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        role: '',
        Etat: ''
    });
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    useEffect(() => {
        fetchUsers();
    }, [accessToken]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/users/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                setError('Erreur lors de la suppression de l\'utilisateur');
            }
        }
    };

    const handleBatchDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ?')) {
            try {
                await Promise.all(selectedUsers.map(id =>
                    axios.delete(`http://localhost:8000/api/users/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    })
                ));
                setUsers(users.filter(user => !selectedUsers.includes(user.id)));
                setSelectedUsers([]);
            } catch (error) {
                setError('Erreur lors de la suppression des utilisateurs sélectionnés');
            }
        }
    };

    const handleCheckboxChange = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleChangeStatus = async (newStatus) => {
        try {
            await Promise.all(selectedUsers.map(userId =>
                axios.put(`http://localhost:8000/api/users/${userId}/status`, { Etat: newStatus }, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            ));
            toast.success('Statut mis à jour avec succès');
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
        }
    };

    

    // Filter users based on search query and other filters
   // Filter users based on search query and other filters
const filteredUsers = users.filter(user => {
    const matchesSearchQuery = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               user.Etat.toLowerCase().includes(searchQuery.toLowerCase()) || // Check Etat
                               (user.role === 1 ? 'Admin' : 'Utilisateur').toLowerCase().includes(searchQuery.toLowerCase()); // Check Rôle

    const attributeFilter = (filters.role ? user.role === parseInt(filters.role) : true) &&
        (filters.Etat ? user.Etat === filters.Etat : true);

    return matchesSearchQuery && attributeFilter;
});

    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(offset, offset + itemsPerPage);

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion des Utilisateurs</h1>
           
                {/* Single Search Bar */}
            <div className="mb-4 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-25" // Adjust the width here
                    placeholder="Rechercher par nom, email, état, ou rôle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
           
               
            </div>
            <Link to="/dashboard/UserCreate" className="btn btn-primary mb-2">Ajouter un Utilisateur</Link>
            <button 
                onClick={handleBatchDelete} 
                className="btn btn-danger mb-2"
                disabled={selectedUsers.length === 0}
            >
                Supprimer 
            </button>
            {error && <p className="text-danger">{error}</p>}
            <div className="mb-4">
                <button onClick={() => handleChangeStatus('approuve')} className="btn btn-primary mb-2">Approuver</button>
                <button onClick={() => handleChangeStatus('non approuve')} className="btn btn-danger mb-2">Désapprouver</button>
            </div>
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                onChange={(e) => setSelectedUsers(e.target.checked ? currentUsers.map(u => u.id) : [])}
                                checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                            />
                        </th>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>État</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length ? (
                        currentUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleCheckboxChange(user.id)}
                                    />
                                </td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role === 1 ? 'Admin' : 'Utilisateur'}</td>
                                <td>{user.Etat}</td>
                               
                                        <td  style={{ width: '80px' }}>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/dashboard/UserEdit/${user.id}`} className="btn btn-primary mb-2">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(user.id)} className="btn btn-danger mb-2">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Aucun utilisateur disponible</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <nav>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button onClick={() => setCurrentPage(currentPage - 1)} className="page-link">&laquo;</button>
                    </li>
                    {[...Array(pageCount)].map((_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button onClick={() => setCurrentPage(index + 1)} className="page-link">
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                        <button onClick={() => setCurrentPage(currentPage + 1)} className="page-link">&raquo;</button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminUtilisateur;
