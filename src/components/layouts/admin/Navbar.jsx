import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import { BASE_URL, getConfig } from '../../../helpers/config';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../../../assets/labol2is.png';

const Navbar = () => {
  const { accessToken, setAccessToken, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isEquipesOpen, setIsEquipesOpen] = useState(false);
  const [isPublicationsOpen, setIsPublicationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isPublicationsEnAttenteOpen, setIsPublicationsEnAttenteOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({
    habilitations: 0,
    theses: 0,
    reports: 0,
    brevets: 0,
    revues: 0,
    ouvrages: 0,
  });
  const [logoUrl, setLogoUrl] = useState('');

//add fetch axios logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/home-descriptions");
        const data = await response.json();
        if (data && data.logo_url) {
          setLogoUrl(data.logo_url); // Assuming the API provides the logo URL in `logo_url`
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const fetchPendingCounts = async () => {
    try {
      const [habilitations, theses, reports, brevets, revues, ouvrages] = await Promise.all([
        axios.get(`${BASE_URL}/habilitationnAdmin`, getConfig(accessToken)),
        axios.get(`${BASE_URL}/thesesAdmin`, getConfig(accessToken)),
        axios.get(`${BASE_URL}/reports`, getConfig(accessToken)),
        axios.get(`${BASE_URL}/brevets`, getConfig(accessToken)),
        axios.get(`${BASE_URL}/revues`, getConfig(accessToken)),
        axios.get(`${BASE_URL}/ouvrages`, getConfig(accessToken)),
      ]);

      setPendingCounts({
        habilitations: habilitations.data.length || 0,
        theses: theses.data.length || 0,
        reports: reports.data.length || 0,
        brevets: brevets.data.length || 0,
        revues: revues.data.length || 0,
        ouvrages: ouvrages.data.length || 0,
      });
    } catch (error) {
      console.error('Error fetching pending counts:', error);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
  }, [accessToken]);

  const logoutUser = async () => {
    try {
      await axios.post(`${BASE_URL}/user/logout`, null, getConfig(accessToken));
      localStorage.removeItem('currentToken');
      setAccessToken('');
      setCurrentUser(null);
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('currentToken');
        setAccessToken('');
        setCurrentUser(null);
        toast.error('Déconnexion échouée');
        navigate('/');
      }
      console.log(error);
    }
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
           
            <img
            src={logoUrl || "./assets/labol2is.png"} // Fallback to default if logo URL is not available
            alt="Laboratory Logo"
            className="h-12 w-auto"
          />
           
          </div>
          <div>
          <Link to="/dashboard/AdminProfile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Admin
              </Link>
          
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:justify-center md:flex-1">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/SidebarConfig" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Menu
              </Link>
              <Link to="/dashboard/AdminHomeDescription" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/dashboard/Utilisateur" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Utilisateurs
              </Link>
              <Link to="/dashboard/NewsAdmin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Actualités
              </Link>
              <Link to="/dashboard/Member" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Members
              </Link>

              {/* Équipes Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsEquipesOpen(!isEquipesOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Équipes
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isEquipesOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/dashboard/equipe" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Équipe</Link>
                      <Link to="/dashboard/PresentationAdmin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Présentation</Link>
                      <Link to="/dashboard/axe" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Axes de Recherche</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Publications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsPublicationsOpen(!isPublicationsOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Publications
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isPublicationsOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/dashboard/ouvrage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ouvrages</Link>
                      <Link to="/dashboard/revues" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Revues</Link>
                      <Link to="/dashboard/report" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rapports</Link>
                      <Link to="/dashboard/brevet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Brevets</Link>
                      <Link to="/dashboard/theses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thèses et Doctorat</Link>
                      <Link to="/dashboard/habilitation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Habilitation</Link>
                      <Link to="/dashboard/conference" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Conférences</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Publications en attente Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsPublicationsEnAttenteOpen(!isPublicationsEnAttenteOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Publications en attente
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isPublicationsEnAttenteOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/dashboard/ouvrageenattente" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                        Ouvrages En Attente
                        {pendingCounts.ouvrages > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {pendingCounts.ouvrages}
                          </span>
                        )}
                      </Link>
                      <Link to="/dashboard/revuesenattente" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                        Revues En Attente
                        {pendingCounts.revues > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {pendingCounts.revues}
                          </span>
                        )}
                      </Link>
                      <Link to="/dashboard/reportenattente" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                        Rapports En Attente
                        {pendingCounts.reports > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {pendingCounts.reports}
                          </span>
                        )}
                      </Link>
                      <Link to="/dashboard/brevetenattente" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                        Brevets En Attente
                        {pendingCounts.brevets > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {pendingCounts.brevets}
                          </span>
                        )}
                      </Link>
                      <Link to="/dashboard/thesesenattente" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                        Thèses En Attente
                        {pendingCounts.theses > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {pendingCounts.theses}
                          </span>
                        )}
                      </Link>
                      <Link to="/dashboard/habilitationenattente" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center">
                        Habilitations En Attente
                        {pendingCounts.habilitations > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {pendingCounts.habilitations}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/dashboard/JobOffer" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Appel à Inscription 
              </Link>
              <Link to="/dashboard/ProjectsAdmin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Projets Industriels
              </Link>
              <Link to="/dashboard/SeminarList" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Séminaires
              </Link>

              {/* Messages Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Messages
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMessagesOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/dashboard/messages/inbox" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Inbox</Link>
                      <Link to="/dashboard/messages/sent" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Messages Envoyés</Link>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={logoutUser}
                className="inline-block px-4 py-1.5 text-blue-500 bg-white border border-blue-500 rounded-lg hover:bg-blue-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/dashboard/SidebarConfig" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Menu
            </Link>
            <Link to="/dashboard/AdminHomeDescription" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Home
            </Link>
            <Link to="/dashboard/Utilisateur" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Utilisateurs
            </Link>
            <Link to="/dashboard/NewsAdmin" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Actualités
            </Link>
            <Link to="/dashboard/Member" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Members
            </Link>
            <button
              onClick={() => setIsEquipesOpen(!isEquipesOpen)}
              className="text-gray-300 hover:text-white block w-full text-center px-3 py-2 rounded-md text-base font-medium"
            >
              Équipes
              <svg className="inline-block ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isEquipesOpen && (
              <div className="pl-6">
                <Link to="/dashboard/equipe" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Équipe</Link>
                <Link to="/dashboard/PresentationAdmin" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Présentation</Link>
                <Link to="/dashboard/axe" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Axes de Recherche</Link>
              </div>
            )}
            <button
              onClick={() => setIsPublicationsOpen(!isPublicationsOpen)}
              className="text-gray-300 hover:text-white block w-full text-center px-3 py-2 rounded-md text-base font-medium"
            >
              Publications
              <svg className="inline-block ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isPublicationsOpen && (
              <div className="pl-6">
                <Link to="/dashboard/ouvrage" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Ouvrages</Link>
                <Link to="/dashboard/revues" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Revues</Link>
                <Link to="/dashboard/report" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Rapports</Link>
                <Link to="/dashboard/brevet" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Brevets</Link>
                <Link to="/dashboard/theses" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Thèses et Doctorat</Link>
                <Link to="/dashboard/habilitation" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Habilitation</Link>
                <Link to="/dashboard/conference" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Conférences</Link>
              </div>
            )}
            <button
              onClick={() => setIsPublicationsEnAttenteOpen(!isPublicationsEnAttenteOpen)}
              className="text-gray-300 hover:text-white block w-full text-center px-3 py-2 rounded-md text-base font-medium"
            >
              Publications en attente
              <svg className="inline-block ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isPublicationsEnAttenteOpen && (
              <div className="pl-6">
                <Link to="/dashboard/ouvrageenattente" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center flex justify-between items-center">
                  Ouvrages En Attente
                  {pendingCounts.ouvrages > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {pendingCounts.ouvrages}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/revuesenattente" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center flex justify-between items-center">
                  Revues En Attente
                  {pendingCounts.revues > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {pendingCounts.revues}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/reportenattente" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center flex justify-between items-center">
                  Rapports En Attente
                  {pendingCounts.reports > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {pendingCounts.reports}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/brevetenattente" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center flex justify-between items-center">
                  Brevets En Attente
                  {pendingCounts.brevets > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {pendingCounts.brevets}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/thesesenattente" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center flex justify-between items-center">
                  Thèses En Attente
                  {pendingCounts.theses > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {pendingCounts.theses}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard/habilitationenattente" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center flex justify-between items-center">
                  Habilitations En Attente
                  {pendingCounts.habilitations > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {pendingCounts.habilitations}
                    </span>
                  )}
                </Link>
              </div>
            )}
            <Link to="/dashboard/JobOffer" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Offres d'emploi
            </Link>
            <Link to="/dashboard/ProjectsAdmin" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Projets Industriels
            </Link>
            <Link to="/dashboard/SeminarList" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">
              Séminaires
            </Link>
            <button
              onClick={() => setIsMessagesOpen(!isMessagesOpen)}
              className="text-gray-300 hover:text-white block w-full text-center px-3 py-2 rounded-md text-base font-medium"
            >
              Messages
              <svg className="inline-block ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMessagesOpen && (
              <div className="pl-6">
                <Link to="/dashboard/messages/inbox" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Inbox</Link>
                <Link to="/dashboard/messages/sent" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium text-center">Messages Envoyés</Link>
              </div>
            )}
            <button
              onClick={logoutUser}
              className="text-gray-300 hover:text-white block w-full text-center px-3 py-2 rounded-md text-base font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;