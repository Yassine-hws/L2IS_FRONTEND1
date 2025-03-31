import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/authContext';
import { BASE_URL, getConfig } from '../../../helpers/config';
import { toast } from 'react-toastify';

const OuvrageEnAttente = () => {
    const { accessToken, currentUser } = useContext(AuthContext);
    const [ouvrages, setOuvrages] = useState([]);
    const [selectedOuvrages, setSelectedOuvrages] = useState([]);

    useEffect(() => {
        const fetchOuvrages = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/ouvrages`, getConfig(accessToken));
                const filteredOuvrages = response.data.filter(
                    (ouvrage) => ouvrage.status === 'en attente' && ouvrage.id_user !== currentUser.id
                );
                setOuvrages(filteredOuvrages);
            } catch (error) {
                console.error('Erreur lors de la récupération des ouvrages en attente:', error);
            }
        };
        fetchOuvrages();
    }, [accessToken, currentUser]);

    const handleSelectAll = () => {
        setSelectedOuvrages(selectedOuvrages.length === ouvrages.length ? [] : ouvrages.map((ouvrage) => ouvrage.id));
    };

    const handleSelectOuvrage = (id) => {
        setSelectedOuvrages((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((ouvrageId) => ouvrageId !== id) : [...prevSelected, id]
        );
    };

    const handleAccept = async (id) => {
        try {
            await axios.post(`${BASE_URL}/ouvrages/accept/${id}`, {}, getConfig(accessToken));
            toast.success('Ouvrage accepté avec succès!');
            setOuvrages(ouvrages.filter((ouvrage) => ouvrage.id !== id));
            setSelectedOuvrages(selectedOuvrages.filter((ouvrageId) => ouvrageId !== id));
        } catch (error) {
            console.error("Erreur lors de l'acceptation de l'ouvrage:", error);
            toast.error("Erreur lors de l'acceptation de l'ouvrage");
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post(`${BASE_URL}/ouvrages/reject/${id}`, {}, getConfig(accessToken));
            toast.success('Ouvrage rejeté avec succès!');
            setOuvrages(ouvrages.filter((ouvrage) => ouvrage.id !== id));
            setSelectedOuvrages(selectedOuvrages.filter((ouvrageId) => ouvrageId !== id));
        } catch (error) {
            console.error("Erreur lors du rejet de l'ouvrage:", error);
            toast.error("Erreur lors du rejet de l'ouvrage");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="ouvrages-en-attente w-full max-w-4xl p-4 bg-white shadow-lg rounded-lg text-left">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Ouvrages en Attente</h2>
                <table className="min-w-full border border-gray-300 bg-white divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">
                                <input
                                    type="checkbox"
                                    checked={selectedOuvrages.length === ouvrages.length && ouvrages.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3 text-left">Titre</th>
                            <th className="px-6 py-3 text-left">Auteur</th>
                            <th className="px-6 py-3 text-left">DOI</th>
                            <th className="px-6 py-3 text-left">Date de publication</th> {/* ✅ Nouvelle colonne */}
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-50">
                        {ouvrages.length > 0 ? (
                            ouvrages.map((ouvrage) => (
                                <tr key={ouvrage.id} className="border-b">
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedOuvrages.includes(ouvrage.id)}
                                            onChange={() => handleSelectOuvrage(ouvrage.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-3">{ouvrage.title}</td>
                                    <td className="px-6 py-3">{ouvrage.author}</td>
                                    <td className="px-6 py-3">
                                        <a
                                            href={`https://doi.org/${ouvrage.DOI}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {ouvrage.DOI}
                                        </a>
                                    </td>
                                    <td className="px-6 py-3">
                                        {ouvrage.date_publication
                                            ? new Date(ouvrage.date_publication).toLocaleDateString()
                                            : 'Non disponible'}
                                    </td> {/* ✅ Affichage formaté de la date */}
                                    <td className="px-6 py-3">
                                        <button
                                            onClick={() => handleAccept(ouvrage.id)}
                                            className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-blue-600 transition"
                                        >
                                            Accepter
                                        </button>
                                        <button
                                            onClick={() => handleReject(ouvrage.id)}
                                            className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400 transition"
                                        >
                                            Rejeter
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">Aucun ouvrage en attente.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OuvrageEnAttente;
