import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './VisitorSidebar.css';
import logo from '../../../assets/labol2is.png';

const VisitorSidebar = () => {
  const [visibility, setVisibility] = useState({
    equipes: true,
    personnel: {
      visible: true,
      membres: true,
      anciens: true,
    },
    publications: {
      visible: true,
      ouvrages: true,
      revues: true,
      conferences: true,
      reports: true,
      thesesDoctorat: true,
      habilitation: true,
    },
    projets: true,
    informations: true,
    evenements: true,
  });

  const [isPersonnelSubmenuOpen, setIsPersonnelSubmenuOpen] = useState(false);
  const [isPublicationsSubmenuOpen, setIsPublicationsSubmenuOpen] = useState(false);

  useEffect(() => {
    const storedVisibility = localStorage.getItem('sidebarVisibility');
    if (storedVisibility) {
      const parsedVisibility = JSON.parse(storedVisibility);
      setVisibility(parsedVisibility);
    }
  }, []);

  const toggleSubmenu = (submenu) => {
    if (submenu === 'personnel') {
      setIsPersonnelSubmenuOpen(!isPersonnelSubmenuOpen);
      setIsPublicationsSubmenuOpen(false);
    } else if (submenu === 'publications') {
      setIsPublicationsSubmenuOpen(!isPublicationsSubmenuOpen);
      setIsPersonnelSubmenuOpen(false);
    }
  };

  return (
    <nav className="visitor-navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <img src={logo} alt="Laboratory Logo" className="logo" />
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Accueil</Link>
          </li>
          {visibility.organisation && (
            <li className="nav-item">
              <Link to="/organisation" className="nav-link">Organisation</Link>
            </li>
          )}
          {visibility.equipes && (
            <li className="nav-item">
              <Link to="/listEquipe" className="nav-link">Équipes</Link>
            </li>
          )}
          {visibility.personnel.visible && (
            <li className="nav-item">
              <button
                onClick={() => toggleSubmenu('personnel')}
                className={`nav-link ${isPersonnelSubmenuOpen ? 'active' : ''}`}
              >
                Membres
              </button>
              <ul className={`nav-submenu ${isPersonnelSubmenuOpen ? 'show' : ''}`}>
                {visibility.personnel.membres && (
                  <li>
                    <Link to="/personnelMember">Membres</Link>
                  </li>
                )}
                {visibility.personnel.anciens && (
                  <li>
                    <Link to="/personnelAncien">Anciens</Link>
                  </li>
                )}
              </ul>
            </li>
          )}
          {visibility.publications.visible && (
            <li className="nav-item">
              <button
                onClick={() => toggleSubmenu('publications')}
                className={`nav-link ${isPublicationsSubmenuOpen ? 'active' : ''}`}
              >
                Publications
              </button>
              <ul className={`nav-submenu ${isPublicationsSubmenuOpen ? 'show' : ''}`}>
                {visibility.publications.ouvrages && <li><Link to="/ouvrages">Ouvrages</Link></li>}
                {visibility.publications.revues && <li><Link to="/revues">Revues</Link></li>}
                {visibility.publications.conferences && <li><Link to="/conferences">Conférences</Link></li>}
                {visibility.publications.reports && <li><Link to="/reports">Rapports et Brevets</Link></li>}
                {visibility.publications.thesesDoctorat && <li><Link to="/theses">Thèses et Habilitation</Link></li>}
              </ul>
            </li>
          )}
          {visibility.projets && (
            <li className="nav-item">
              <Link to="/ProjectsPage" className="nav-link">Projets</Link>
            </li>
          )}
          {visibility.informations && (
            <li className="nav-item">
              <Link to="/informations" className="nav-link">Informations</Link>
            </li>
          )}
          {visibility.evenements && (
            <li className="nav-item">
              <Link to="/evenements" className="nav-link">Événements</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default VisitorSidebar; 