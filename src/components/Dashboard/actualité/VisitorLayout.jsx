// components/layouts/VisitorLayout.js
import { Outlet } from 'react-router-dom';
import fullscreen from '../../../assets/fullscreen.png';
import { useState } from 'react';
import NavbarEdit from '../../../NavbarEdit';
import Footer from '../../../Footer';

const VisitorLayout = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex flex-col h-screen">
      <NavbarEdit /> {/* Replace the header with the Navbar */}
      <div className="flex flex-1 pt-16"> {/* Add padding-top to avoid header overlap */}
        <div className="flex-1 transition-all duration-300 pt-4"> {/* Remove the margin-left */}
          <Outlet />
        </div>
      </div>
      <Footer /> {/* Add the footer */}
    </div>
  );
};

export default VisitorLayout;