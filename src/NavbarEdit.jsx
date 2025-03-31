import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const NavbarEdit = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [visibility, setVisibility] = useState({
    organisation: true,
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
      brevets: true,
      theses: true,
    },
    projets: true,
    informations: true,
    evenements: true,
  });
  const navbarRef = useRef(null);

  // Charger les paramètres de la sidebar depuis localStorage
  useEffect(() => {
    const savedVisibility = JSON.parse(localStorage.getItem("sidebarVisibility"));
    if (savedVisibility) {
      setVisibility(savedVisibility);
    }
  }, []);

  // Récupérer le logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/home-descriptions");
        const data = await response.json();
        if (data && data.logo_url) {
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du logo:", error);
      }
    };

    fetchLogo();
  }, []);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setOpenSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle menu mobile
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Toggle sous-menu
  const toggleSubMenu = (menu) => setOpenSubMenu(openSubMenu === menu ? null : menu);

  return (
    <nav ref={navbarRef} className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logoUrl || "./assets/labol2is.png"} alt="Logo" className="h-12 w-auto" />
        </Link>

        {/* Bouton menu mobile */}
        <button onClick={toggleMenu} className="md:hidden text-[#00bfff]" aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Navigation */}
        <ul className={`md:flex space-x-6 absolute md:relative bg-white w-full md:w-auto top-16 md:top-auto shadow-md md:shadow-none transition-all duration-300 ease-in-out ${isMenuOpen ? "block" : "hidden"}`}>
          {/* Accueil */}
          <li>
            <Link to="/" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
              Accueil
            </Link>
          </li>
          
          {visibility.organisation !== false && (
            <li>
              <Link to="/organisation" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
                Organisation
              </Link>
            </li>
          )}
          {visibility.equipes !== false && (
            <li>
              <Link to="/equipes" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
              Equipes
              </Link>
            </li>
          )}

          {/* Membres */}
          {visibility.personnel?.visible !== false && (
            <li className="relative group">
              <button onClick={() => toggleSubMenu("membres")} className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
                Membres
              </button>
              <ul className={`absolute bg-white shadow-lg w-48 rounded transition-all duration-300 ${openSubMenu === "membres" ? "block" : "hidden"}`}>
                {visibility.personnel?.membres !== false && (
                  <li>
                    <Link to="/personnelMember" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Membres
                    </Link>
                  </li>
                )}
                {visibility.personnel?.anciens !== false && (
                  <li>
                    <Link to="/personnelAncien" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Anciens
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {/* Publications */}
          {visibility.publications?.visible !== false && (
            <li className="relative group">
              <button onClick={() => toggleSubMenu("publications")} className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
                Publications
              </button>
              <ul className={`absolute bg-white shadow-lg w-56 rounded transition-all duration-300 ${openSubMenu === "publications" ? "block" : "hidden"}`}>
                {visibility.publications?.ouvrages !== false && (
                  <li>
                    <Link to="/ouvrages" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Ouvrages
                    </Link>
                  </li>
                )}
                {visibility.publications?.revues !== false && (
                  <li>
                    <Link to="/revues" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Revues
                    </Link>
                  </li>
                )}
                {visibility.publications?.reports !== false && (
                  <li>
                    <Link to="/reports" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Rapports
                    </Link>
                  </li>
                )}
                {visibility.publications?.brevets !== false && (
                  <li>
                    <Link to="/patents" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Brevets
                    </Link>
                  </li>
                )}
                {visibility.publications?.theses !== false && (
                  <li>
                    <Link to="/theses" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Thèse et Doctorat
                    </Link>
                  </li>
                )}
                {visibility.publications?.conferences !== false && (
                  <li>
                    <Link to="/conferences" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100">
                      Conférences
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          )}

          {/* Projets */}
          {visibility.projets !== false && (
            <li>
              <Link to="/ProjectsPage" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
                Projets
              </Link>
            </li>
          )}

          {/* Informations */}
          {visibility.informations !== false && (
            <li>
              <Link to="/informations" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
                Informations
              </Link>
            </li>
          )}

          {/* Événements */}
          {visibility.evenements !== false && (
            <li>
              <Link to="/evenements" className="block px-4 py-2 text-[#00bfff] hover:text-blue-700 hover:bg-gray-100 rounded">
                Événements
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavbarEdit;