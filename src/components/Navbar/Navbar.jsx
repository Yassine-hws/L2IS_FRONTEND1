import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/dashboard" className="nav-link">Accueil</Link>
                    </li>
                    <li className="nav-item dropdown">
                        <span className="nav-link">Publications</span>
                        <div className="dropdown-content">
                            <Link to="/dashboard/ouvrage" className="dropdown-item">Ouvrages</Link>
                            <Link to="/dashboard/revues" className="dropdown-item">Revues</Link>
                            <Link to="/dashboard/report" className="dropdown-item">Rapports</Link>
                            <Link to="/dashboard/patent" className="dropdown-item">Brevets</Link>
                            <Link to="/dashboard/publications-en-attente" className="dropdown-item">Publications en attente</Link>
                        </div>
                    </li>
                    <li className="nav-item dropdown">
                        <span className="nav-link">Manifestations</span>
                        <div className="dropdown-content">
                            <Link to="/dashboard/manifestation" className="dropdown-item">Liste des manifestations</Link>
                            <Link to="/dashboard/manifestations-en-attente" className="dropdown-item">Manifestations en attente</Link>
                        </div>
                    </li>
                    <li className="nav-item dropdown">
                        <span className="nav-link">Projets</span>
                        <div className="dropdown-content">
                            <Link to="/dashboard/projet" className="dropdown-item">Liste des projets</Link>
                            <Link to="/dashboard/projets-en-attente" className="dropdown-item">Projets en attente</Link>
                        </div>
                    </li>
                    {currentUser?.role === 'admin' && (
                        <li className="nav-item">
                            <Link to="/dashboard/users" className="nav-link">Utilisateurs</Link>
                        </li>
                    )}
                </ul>
                <div className="user-info">
                    <span className="username">{currentUser?.name}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Déconnexion
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 