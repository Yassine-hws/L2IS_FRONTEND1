import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { BASE_URL, getConfig } from '../../helpers/config';
import { toast } from 'react-toastify';
import axios from 'axios';

const UserNavbar = () => {
  const { accessToken, setAccessToken, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');
  const [isMessagesSubmenuOpen, setIsMessagesSubmenuOpen] = useState(false);
  const [isPublicationsSubmenuOpen, setIsPublicationsSubmenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/home-descriptions');
        const data = await response.json();
        if (data && data.logo_url) {
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const togglePublicationsSubmenu = () => {
    setIsPublicationsSubmenuOpen(!isPublicationsSubmenuOpen);
    if (isMessagesSubmenuOpen) setIsMessagesSubmenuOpen(false);
  };

  const toggleMessagesSubmenu = () => {
    setIsMessagesSubmenuOpen(!isMessagesSubmenuOpen);
    if (isPublicationsSubmenuOpen) setIsPublicationsSubmenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              {logoUrl ? (
                <img className="h-10 w-auto" src={logoUrl} alt="Laboratory Logo" />
              ) : (
                <span className="text-gray-700 font-bold">Logo</span>
              )}
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium" to="/user/UserProfile">
              Dashboard
            </Link>
            <Link className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium" to="/user/UserInfo">
              Paramètres
            </Link>
            <div className="relative">
              <button onClick={togglePublicationsSubmenu} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                Publications
              </button>
              {isPublicationsSubmenuOpen && (
                <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link to="/user/UserOuvrage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ouvrages</Link>
                    <Link to="/user/UserRevues" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Revues</Link>
                    <Link to="/user/UserBrevet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Brevets</Link>
                    <Link to="/user/UserRapport" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rapports</Link>
                    <Link to="/user/UserThèse" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Thèses et Doctorat</Link>
                    <Link to="/user/UserHabilitation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Habilitation</Link>
                  </div>
                </div>
              )}
            </div>
            <button onClick={logoutUser} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Déconnexion
            </button>
          </div>
          <div className="flex items-center md:hidden">
            <button onClick={toggleMobileMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/user/UserProfile" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <Link to="/user/UserInfo" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
              Paramètres
            </Link>
            <button onClick={togglePublicationsSubmenu} className="w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium flex items-center justify-between">
              Publications
            </button>
            {isPublicationsSubmenuOpen && (
              <div className="pl-4">
                <Link to="/user/UserOuvrage" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Ouvrages</Link>
                <Link to="/user/UserRevues" className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Revues</Link>
              </div>
            )}
            <button onClick={logoutUser} className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
