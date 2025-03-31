import React from 'react';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import '../../../assets/admin/css/styles.css';
import '../../../assets/admin/js/scripts.js';
import Statistics from '../../../../src/pages/Statistics.jsx';
import Navbar from './Navbar';
import UserProfile from '../../../components/User/UserProfile';

const MasterLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Container */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MasterLayout;
