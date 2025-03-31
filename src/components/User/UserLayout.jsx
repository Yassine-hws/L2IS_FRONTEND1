// UserLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import './MasterUser.css'; // Import CSS

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Contenu principal */}
      <div className="flex-1 pt-16"> {/* Ajoutez un padding-top pour compenser la hauteur de la navbar */}
        <main className="p-4"> {/* Ajoutez un padding pour l'espacement */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;