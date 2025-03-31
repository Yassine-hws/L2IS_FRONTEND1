import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../helpers/config';
import useValidation from '../custom/useValidation';
import Spinner from '../layouts/Spinner';
import { AuthContext } from '../../context/authContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const navigate = useNavigate();
    const { setAccessToken, setCurrentUser } = useContext(AuthContext);

    useEffect(() => {
        const savedCredentials = JSON.parse(localStorage.getItem('savedCredentials')) || {};
        const savedEmails = Object.keys(savedCredentials);
        if (savedEmails.length > 0) {
            setEmail(savedEmails[0]);
            setPassword(savedCredentials[savedEmails[0]]);
        }
    }, []);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/home-descriptions");
                const data = await response.json();
                if (data && data.logo_url) {
                    setLogoUrl(data.logo_url);
                }
            } catch (error) {
                console.error("Error fetching logo:", error);
            }
        };
        fetchLogo();
    }, []);

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        const savedCredentials = JSON.parse(localStorage.getItem('savedCredentials')) || {};
        setPassword(savedCredentials[newEmail] || '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);
        setLoading(true);
        const data = { email, password };

        try {
            const response = await axios.post(`${BASE_URL}/user/login`, data);
            if (response.data.error) {
                setLoading(false);
                toast.error(response.data.error);
            } else {
                localStorage.setItem('currentToken', JSON.stringify(response.data.currentToken));
                setAccessToken(response.data.currentToken);
                setCurrentUser(response.data.user);

                if (rememberMe) {
                    const savedCredentials = JSON.parse(localStorage.getItem('savedCredentials')) || {};
                    savedCredentials[email] = password;
                    localStorage.setItem('savedCredentials', JSON.stringify(savedCredentials));
                }

                setLoading(false);
                setEmail('');
                setPassword('');
                toast.success(response.data.message);

                if (response.data.user.role === 1) {
                    navigate('/dashboard/AdminProfile');
                } else {
                    navigate('/user/UserProfile');
                }
            }
        } catch (error) {
            setLoading(false);
            if (error?.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
            console.error(error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6">
            {logoUrl && (
                <div className="mb-6">
                    <img src={logoUrl} alt="Logo" className="h-20" />
                </div>
            )}
            <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-xl">
                <h2 className="text-center text-2xl font-bold text-gray-800">Connexion</h2>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Entrer votre email"
                        />
                        {useValidation(errors, 'email')}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Entrer votre mot de passe"
                        />
                        {useValidation(errors, 'password')}
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <span className="ml-2">Se souvenir de moi</span>
                        </label>
                    </div>
                    <div>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <button
                                type="submit"
                                className="w-full p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
                            >
                                Connexion
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
