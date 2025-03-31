import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/authContext';

const MemberEdit = () => {
  const { id } = useParams();
  const [member, setMember] = useState({
    name: '',
    position: '',
    bio: '',
    contact_info: '',
    statut: '',
    email: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/members/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        setMember(response.data);
        if (response.data.image) {
          setImagePreview(`http://localhost:8000/storage/${response.data.image}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations du membre', error);
        toast.error('Erreur lors du chargement des informations du membre');
      }
    };
    fetchMember();
  }, [id, accessToken]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMember({
          ...member,
          image: reader.result, // Encoded base64 image
        });
        setImagePreview(reader.result); // Display the image preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si l'image n'a pas été modifiée et que l'image actuelle est définie
    if (!member.image && imagePreview) {
      member.image = imagePreview;
    }
    
    try {
      const response = await axios.put(`http://localhost:8000/api/members/${id}`, member, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      toast.success('Membre mis à jour avec succès');
      navigate('/dashboard/Member');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        setError('Erreur de validation : ' + Object.values(validationErrors).flat().join(', '));
      } else {
        setError('Erreur lors de la mise à jour du membre');
      }
      toast.error('Erreur lors de la mise à jour du membre');
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember({
      ...member,
      [name]: value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4" style={{ paddingBottom: '16px' }}>
      <h1 className="text-2xl font-bold mb-4">Modifier le Membre</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input 
            type="text" 
            name="name" 
            value={member.name} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <input 
            type="text" 
            name="position" 
            value={member.position} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Biographie</label>
          <textarea 
            name="bio" 
            value={member.bio} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Informations de Contact</label>
          <input 
            type="text" 
            name="contact_info" 
            value={member.contact_info} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select 
            name="statut" 
            value={member.statut} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Sélectionner un statut</option>
            <option value="Membre">Membre</option>
            <option value="Ancien">Ancien</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            value={member.email} 
            onChange={handleChange} 
            required 
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Mettre à jour
                </button>
      </form>
    </div>
  );
};

export default MemberEdit;
