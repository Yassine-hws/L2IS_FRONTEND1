import React, { useContext } from 'react';
import { AuthContext } from '../../context/authContext'; // Assurez-vous que le chemin est correct
import './UserProfile.css'; // Import the CSS file for styling and animation
import Userstatistics from './Userstatistics'; // Import the Userstatistics component

function UserProfile() {
    const { currentUser } = useContext(AuthContext);

    

    return (
        <div className="user-profile">
                    <Userstatistics />
                </div>
          
    );
}

export default UserProfile;
