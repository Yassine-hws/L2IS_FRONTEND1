// MasterUser.jsx
import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/authContext'; // Import context
import UserNavbar from './UserNavbar'; // Import UserNavbar
import './MasterUser.css'; // Import CSS

const MasterUser = () => {
  const { currentUser } = useContext(AuthContext); // Get currentUser from context

  return (
    <div className="flex flex-col min-h-screen">
      {/* Include UserNavbar at the top */}
      <UserNavbar />

      {/* Main content area */}
      <div className="flex-1 pt-16"> {/* Add padding-top to account for the navbar height */}
        <main className="p-4"> {/* Add padding for spacing */}
          <Outlet /> {/* This will render the nested routes */}
        </main>
      </div>

      {/* You can add a footer here if needed */}
    </div>
  );
};

export default MasterUser;