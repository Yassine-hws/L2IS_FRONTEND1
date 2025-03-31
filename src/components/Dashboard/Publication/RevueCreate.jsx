import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';

const RevueCreate = () => {
    const [title, setTitle] = useState('');
    const [DOI, setDOI] = useState('');
    const [date_publication, setDatePublication] = useState(new Date().toISOString().split('T')[0]);
    const [members, setMembers] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [selectedAuthorIds, setSelectedAuthorIds] = useState([]);
    const [optionalAuthors, setOptionalAuthors] = useState(['']);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { currentUser, accessToken } = useContext(AuthContext);

    // Fetch members for authors
    const fetchMembers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/members', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const filteredMembers = response.data.filter(member => member.name !== currentUser.name);
            setMembers(filteredMembers);
        } catch (error) {
            console.error('Erreur lors de la récupération des membres :', error);
            setError('Erreur lors de la récupération des membres');
            toast.error('Erreur lors de la récupération des membres');
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [accessToken]);

    useEffect(() => {
        setSelectedAuthors([currentUser.name]);
        setSelectedAuthorIds([currentUser.id]);
    }, [currentUser]);

    const validateDOI = (doi) => {
        const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
        return doiPattern.test(doi);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedAuthorIds.length === 0) {
            setError('Veuillez sélectionner au moins un auteur.');
            toast.error('Veuillez sélectionner au moins un auteur.');
            return;
        }

        if (!validateDOI(DOI)) {
            setError('Format du DOI invalide.');
            toast.error('Format du DOI invalide.');
            return;
        }

        // Check if DOI exists in the database
       // Check if DOI exists in the database
try {
    const checkDOIResponse = await axios.post('http://localhost:8000/api/checkDOIExistsRevue', {
        doi: DOI.toLowerCase(),  // Send DOI as lowercase
    }, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (checkDOIResponse.data.exists) {
        setError('Le DOI existe déjà.');
        toast.error('Le DOI existe déjà.');
        return;
    }
} catch (error) {
    console.error('Erreur lors de la vérification du DOI :', error);
    setError('Erreur lors de la vérification du DOI');
    toast.error('Erreur lors de la vérification du DOI');
    return;
}


        const filteredOptionalAuthors = optionalAuthors.filter(author => author.trim() !== '');
        let allAuthors = [currentUser.name, ...selectedAuthors, ...filteredOptionalAuthors];
        allAuthors = [...new Set(allAuthors)];

        const validAuthorIds = [currentUser.id, ...selectedAuthorIds];

        try {
            const response = await axios.post('http://localhost:8000/api/revues', {
                title,
                author: allAuthors.join(', '),
                DOI,
                date_publication,
                id_user: validAuthorIds.join(','),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            console.log('Revue ajouté:', response.data);
            toast.success('Revue ajoutée avec succès');
            navigate('/dashboard/revues');
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la revue :', error);
            setError('Erreur lors de l\'ajout de la revue');
            toast.error('Erreur lors de l\'ajout de la revue');
        }
    };

    const handleAuthorSelection = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const names = selectedOptions.map(option => option.value);
        const ids = selectedOptions.map(option => option.getAttribute('data-id'));

        setSelectedAuthors(names);
        setSelectedAuthorIds(ids);
    };

    const handleAddOptionalAuthor = () => {
        setOptionalAuthors([...optionalAuthors, '']);
    };

    const handleOptionalAuthorChange = (index, value) => {
        const newOptionalAuthors = [...optionalAuthors];
        newOptionalAuthors[index] = value;
        setOptionalAuthors(newOptionalAuthors);
    };

    const handleRemoveOptionalAuthor = (index) => {
        const newOptionalAuthors = optionalAuthors.filter((_, i) => i !== index);
        setOptionalAuthors(newOptionalAuthors);
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Ajouter une Revue</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Titre</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Membre(s)</label>
                    <select
                        multiple
                        value={selectedAuthors}
                        onChange={handleAuthorSelection}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {members.map(member => (
                            <option key={member.id} value={member.name} data-id={member.user_id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                        Pour sélectionner plusieurs membres, maintenez la touche <strong>Ctrl</strong> (ou <strong>Cmd</strong> sur Mac) enfoncée.
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Autre auteur(s)</label>
                    <div className="space-y-2">
                        {optionalAuthors.map((author, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => handleOptionalAuthorChange(index, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveOptionalAuthor(index)}
                                    className="ml-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                >
                                    &minus;
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={handleAddOptionalAuthor}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            Ajouter plus d'auteur(s) 
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">DOI</label>
                    <input
                        type="text"
                        value={DOI}
                        onChange={(e) => setDOI(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Date de publication</label>
                    <input
                        type="date"
                        value={date_publication}
                        onChange={(e) => setDatePublication(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"          
                >
                    Ajouter
                </button>
            </form>
        </div>
    );
};

export default RevueCreate;
