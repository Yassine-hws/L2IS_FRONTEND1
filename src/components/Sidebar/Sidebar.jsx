import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import './Sidebar.css';
import { FaBook, FaNewspaper, FaFile, FaPatent, FaCalendar, FaProjectDiagram, FaUsers, FaClock } from 'react-icons/fa';

const Sidebar = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="sidebar">
            <ul className="menu">
                <li className="menu-item">
                    <Link to="/dashboard" className="menu-link">
                        <FaBook className="menu-icon" />
                        Publications
                    </Link>
                    <ul className="submenu">
                        <li>
                            <Link to="/dashboard/ouvrage" className="submenu-item">
                                <FaBook className="icon" />
                                Ouvrages
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/revues" className="submenu-item">
                                <FaNewspaper className="icon" />
                                Revues
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/report" className="submenu-item">
                                <FaFile className="icon" />
                                Rapports
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/patent" className="submenu-item">
                                <FaPatent className="icon" />
                                Brevets
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/publications-en-attente" className="submenu-item">
                                <FaClock className="icon" />
                                Publications en attente
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="menu-item">
                    <Link to="/dashboard/manifestation" className="menu-link">
                        <FaCalendar className="menu-icon" />
                        Manifestations
                    </Link>
                    <ul className="submenu">
                        <li>
                            <Link to="/dashboard/manifestation" className="submenu-item">
                                <FaCalendar className="icon" />
                                Liste des manifestations
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/manifestations-en-attente" className="submenu-item">
                                <FaClock className="icon" />
                                Manifestations en attente
                            </Link>
                        </li>
                    </ul>
                </li>

                <li className="menu-item">
                    <Link to="/dashboard/projet" className="menu-link">
                        <FaProjectDiagram className="menu-icon" />
                        Projets
                    </Link>
                    <ul className="submenu">
                        <li>
                            <Link to="/dashboard/projet" className="submenu-item">
                                <FaProjectDiagram className="icon" />
                                Liste des projets
                            </Link>
                        </li>
                        <li>
                            <Link to="/dashboard/projets-en-attente" className="submenu-item">
                                <FaClock className="icon" />
                                Projets en attente
                            </Link>
                        </li>
                    </ul>
                </li>

                {currentUser?.role === 'admin' && (
                    <li className="menu-item">
                        <Link to="/dashboard/users" className="menu-link">
                            <FaUsers className="menu-icon" />
                            Utilisateurs
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar; 