import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/authContext';

const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

const AdminHomeDescription = () => {
    const [description, setDescription] = useState(null);
    const [showFullContent, setShowFullContent] = useState(false);
    const { accessToken } = useContext(AuthContext);

    useEffect(() => {
        fetchDescription();
    }, []);

    const fetchDescription = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/home-descriptions', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setDescription(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération de la description", error);
            toast.error('Erreur lors de la récupération des données');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette description ?')) {
            try {
                await axios.delete(`http://localhost:8000/api/home-descriptions/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                toast.success('Description supprimée avec succès');
                fetchDescription(); // Refresh data
            } catch (error) {
                console.error("Erreur lors de la suppression de la description", error);
                toast.error('Erreur lors de la suppression de la description');
            }
        }
    };

    const toggleContent = () => {
        setShowFullContent(!showFullContent);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 font-weight-bold display-4">Gestion de la Description</h1>
            <div className="mb-4">
                <Link to="/dashboard/CreateDescription" className="btn btn-primary">
                    Ajouter une description
                </Link>
            </div>

            {description ? (
                <div className="card shadow-sm">
                    <div className="card-body">
                        {description.content ? (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th scope="col">Contenu</th>
                                        <th scope="col">Image</th>
                                        <th scope="col">Logo</th> {/* NEW: Added Logo Column */}
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {stripHtmlTags(showFullContent ? description.content : description.content.substring(0, 200))}
                                            {description.content.length > 200 && (
                                                <button className="btn btn-link" onClick={toggleContent}>
                                                    {showFullContent ? 'Lire moins' : 'Lire la suite'}
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            {description.image_url && (
                                                <img
                                                    src={description.image_url}
                                                    alt="Description Image"
                                                    style={{ maxWidth: '100px', height: 'auto' }}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            {description.logo_url && (
                                                <img
                                                    src={description.logo_url}
                                                    alt="Logo"
                                                    style={{ maxWidth: '100px', height: 'auto' }}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-end">
                                                <Link to={`/dashboard/EditDescription/${description.id}`} className="btn btn-primary mb-2">
                                                    Modifier
                                                </Link>
                                                <button className="btn btn-danger mb-2" onClick={() => handleDelete(description.id)}>
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <p>Aucun contenu disponible.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Aucune description de laboratoire disponible.</p>
            )}
        </div>
    );
};

export default AdminHomeDescription;
