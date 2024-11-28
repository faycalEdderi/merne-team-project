import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Swal from 'sweetalert2';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du profil');
            }

            const data = await response.json();
            setUserData(data);
            setFormData({
                username: data.username,
                email: data.email,
                password: ''
            });
        } catch (error) {
            setError(error.message);
            if (error.message.includes('Non autorisé')) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const updateData = {
                ...formData,
                // N'inclure le mot de passe que s'il est fourni
                ...(formData.password && { password: formData.password })
            };

            const response = await fetch('http://localhost:8080/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }

            const data = await response.json();
            setUserData(data);
            
            await Swal.fire({
                icon: 'success',
                title: 'Profil mis à jour!',
                text: 'Vos modifications ont été enregistrées avec succès',
                timer: 1500,
                showConfirmButton: false
            });

            setIsEditing(false);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message
            });
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: "Cette action est irréversible!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/delete/${userData._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression du compte');
                }

                Swal.fire(
                    'Supprimé!',
                    'Votre compte a été supprimé avec succès.',
                    'success'
                );

                localStorage.removeItem('token');
                navigate('/login');
            } catch (error) {
                Swal.fire(
                    'Erreur!',
                    error.message,
                    'error'
                );
            }
        }
    };

    if (!userData) {
        return <div className="profile-loading">Chargement...</div>;
    }

    return (
        <div className="profile-container">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {!isEditing ? (
                <div className="profile-info">
                    <h2>Mon Profil</h2>
                    <div className="info-group">
                        <label>Nom d'utilisateur:</label>
                        <p>{userData.username}</p>
                    </div>
                    <div className="info-group">
                        <label>Email:</label>
                        <p>{userData.email}</p>
                    </div>
                    
                    <div className="profile-actions">
                        <button 
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            Modifier le profil
                        </button>
                        <button 
                            className="delete-button"
                            onClick={handleDelete}
                        >
                            Supprimer le compte
                        </button>
                    </div>
                </div>
            ) : (
                <form className="profile-form" onSubmit={handleUpdate}>
                    <h2>Modifier le profil</h2>
                    
                    <div className="form-group">
                        <label>Nom d'utilisateur:</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nouveau mot de passe (optionnel):</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Laissez vide pour ne pas changer"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-button">
                            Enregistrer
                        </button>
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    username: userData.username,
                                    email: userData.email,
                                    password: ''
                                });
                            }}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Profile;