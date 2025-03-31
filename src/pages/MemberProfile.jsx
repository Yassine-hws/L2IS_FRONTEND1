import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import defaultImage from '../assets/photo.png';
import { FaEnvelope, FaUserGraduate, FaBuilding } from 'react-icons/fa';


const MemberProfile = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [ouvrages, setOuvrages] = useState([]);
  const [revues, setRevues] = useState([]);
  const [habilitations, setHabilitations] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [theses, setTheses] = useState([]);
  const [brevets, setBrevets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations du membre
        const memberResponse = await axios.get(`http://localhost:8000/api/members/${id}`);
        setMember(memberResponse.data);
        console.log("id_user:", memberResponse.data.user_id);

        // Récupérer les ouvrages associés à l'utilisateur du membre et les ouvrages où il est contributeur
        const ouvragesResponse = await axios.get(`http://localhost:8000/api/ouvrages/user-or-contributor/${memberResponse.data.user_id}`);
        setOuvrages(ouvragesResponse.data);
        console.log("Ouvr:", ouvragesResponse.data);

        // Récupérer les revues associées à l'utilisateur du membre et les revues où il est contributeur
        const revuesResponse = await axios.get(`http://localhost:8000/api/revues/user-or-contributor/${memberResponse.data.user_id}`);
        setRevues(revuesResponse.data);
        console.log("Revues:", revuesResponse.data);

        // Récupérer les habilitations associées
        const habilitationsResponse = await axios.get(`http://localhost:8000/api/habilitations/user-or-contributor/${memberResponse.data.user_id}`);
        setHabilitations(habilitationsResponse.data);
        console.log("Habilitations:", habilitationsResponse.data);

        // Récupérer les rapports associés
        const rapportsResponse = await axios.get(`http://localhost:8000/api/rapports/user-or-contributor/${memberResponse.data.user_id}`);
        setRapports(rapportsResponse.data);
        console.log("Rapports:", rapportsResponse.data);

        // Récupérer les thèses associées
        const thesesResponse = await axios.get(`http://localhost:8000/api/theses/user-or-contributor/${memberResponse.data.user_id}`);
        setTheses(thesesResponse.data);
        console.log("Thèses:", thesesResponse.data);

        // Récupérer les brevets associés
        const brevetsResponse = await axios.get(`http://localhost:8000/api/brevets/user-or-contributor/${memberResponse.data.user_id}`);
        setBrevets(brevetsResponse.data);
        console.log("Brevets:", brevetsResponse.data);

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Erreur lors de la récupération du profil membre ou des publications.');
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div style={styles.container}>
      {member ? (
        <>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.imageWrapper}>
                  <img
                    src={member.image ? `http://localhost:8000/storage/${member.image}` : defaultImage}
                    alt={member.name}
                    className="profile-image"
                  />
                </td>
              </tr>
              <tr>
                <td style={styles.name}>{member.name}</td>
              </tr>
              <tr>
                <td style={styles.infoContainer}>
                  {member.position && (
                    <div style={styles.infoItem}>
                      <FaUserGraduate style={styles.icon} />
                      <span>{member.position}</span>
                    </div>
                  )}
                  {member.bio && (
                    <div style={styles.infoItem}>
                      <FaBuilding style={styles.icon} />
                      <span>{member.bio}</span>
                    </div>
                  )}
                  {member.email && (
                    <div style={styles.infoItem}>
                      <FaEnvelope style={styles.icon} />
                      <span>{member.email}</span>
                    </div>
                  )}
                  
                  {/* Affichage des ouvrages */}
                  {ouvrages.length > 0 && (
                    <div style={styles.infoItem}>
                      <ul className="ouvrages-list">
                        <h3 style={styles.publicationsTitle}>Ouvrages</h3>
                        <hr style={styles.sectionDivider} />
                        {ouvrages.map(ouvrage => (
                          <li key={ouvrage.id}>
                            <strong>{ouvrage.title || 'Titre non disponible'}.</strong> {ouvrage.author || 'Auteur non disponible'}.
                            <a href={`https://doi.org/${ouvrage.DOI}`} target="_blank" rel="noopener noreferrer" className="doi-link">DOI</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Affichage des revues */}
                  {revues.length > 0 && (
                    <div style={styles.infoItem}>
                      <ul className="revues-list">
                        <h3 style={styles.publicationsTitle}>Revues</h3>
                        <hr style={styles.sectionDivider} />
                        {revues.map(revue => (
                          <li key={revue.id}>
                            <strong>{revue.title || 'Titre non disponible'}.</strong> {revue.author || 'Auteur non disponible'}.
                            <a href={`https://doi.org/${revue.DOI}`} target="_blank" rel="noopener noreferrer" className="doi-link">DOI</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                
                  {/* Affichage des rapports */}
                  {rapports.length > 0 && (
                    <div style={styles.infoItem}>
                      <ul className="rapports-list">
                        <h3 style={styles.publicationsTitle}>Rapports</h3>
                        <hr style={styles.sectionDivider} />
                        {rapports.map(rapport => (
                          <li key={rapport.id}>
                            <strong>{rapport.title || 'Titre non disponible'}.</strong> {rapport.author || 'Auteur non disponible'}.
                            <a href={`https://doi.org/${rapport.DOI}`} target="_blank" rel="noopener noreferrer" className="doi-link">DOI</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Affichage des thèses */}
                  {theses.length > 0 && (
                    <div style={styles.infoItem}>
                      <ul className="theses-list">
                        <h3 style={styles.publicationsTitle}>Thèses</h3>
                        <hr style={styles.sectionDivider} />
                        {theses.map(these => (
                          <li key={these.id}>
                            <strong>{these.title || 'Titre non disponible'}.</strong> {these.author || 'Auteur non disponible'}.
                            <a href={`https://doi.org/${these.DOI}`} target="_blank" rel="noopener noreferrer" className="doi-link">DOI</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Affichage des brevets */}
                  {brevets.length > 0 && (
                    <div style={styles.infoItem}>
                      <ul className="brevets-list">
                        <h3 style={styles.publicationsTitle}>Brevets</h3>
                        <hr style={styles.sectionDivider} />
                        {brevets.map(brevet => (
                          <li key={brevet.id}>
                            <strong>{brevet.title || 'Titre non disponible'}.</strong> {brevet.author || 'Auteur non disponible'}.
                            <a href={`https://doi.org/${brevet.DOI}`} target="_blank" rel="noopener noreferrer" className="doi-link">DOI</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                    {/* Affichage des habilitations */}
                    {habilitations.length > 0 && (
                    <div style={styles.infoItem}>
                      <ul className="habilitations-list">
                        <h3 style={styles.publicationsTitle}>Habilitations</h3>
                        <hr style={styles.sectionDivider} />
                        {habilitations.map(habilitation => (
                          <li key={habilitation.id}>
                            <strong>{habilitation.title || 'Titre non disponible'}.</strong> {habilitation.author || 'Auteur non disponible'}.
                            <a href={`https://doi.org/${habilitation.DOI}`} target="_blank" rel="noopener noreferrer" className="doi-link">DOI</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <p>Chargement du profil...</p>
      )}
    </div>
  );
};

const styles = {
  publicationsTitle: {
    margin: '10px 0',
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'left',
    color: '#333',
  },
  container: {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)',
     alignItems: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  imageWrapper: {
    textAlign: 'center',
    padding: '20px',
  },
  name: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '20px 0',
    color: '#222',
  },
  infoContainer: {
    textAlign: 'left',
    padding: '0 20px',
  },
  sectionDivider: {
    border: '2px solid #05a7bd',
    width: '175px',
    margin: '-1px left',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#555',
    margin: '10px 0',
  },
  icon: {
    marginRight: '15px',
    color: '#87CEEB',
    fontSize: '24px',
    minWidth: '30px',  // Ensure icon size consistency
    minHeight: '30px', // Ensure icon size consistency
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
};



export default MemberProfile;
