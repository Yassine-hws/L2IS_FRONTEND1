import React, { useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import '../../../src/components/User/UserProfile.css';
import Statistics from '../../pages/Statistics'; // Adjust the path as needed

function AdminProfile() {
    const { currentUser } = useContext(AuthContext);

    return (   
       <Statistics />
    );
}

export default AdminProfile;