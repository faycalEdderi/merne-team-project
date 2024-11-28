import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Dashboard.css';

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();

    const checkAdminStatus = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setIsAdmin(data.role === 'admin');
            
            if (data.role !== 'admin') {
                navigate('/');
            }
        } catch (error) {
            console.error('Erreur:', error);
            navigate('/');
        }
    }, [navigate]);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, []);

    useEffect(() => {
        checkAdminStatus();
        fetchUsers();
    }, [checkAdminStatus, fetchUsers]);

    const handleDelete = async (userId) => {
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
                const response = await fetch(`http://localhost:8080/delete/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    Swal.fire('Supprimé!', 'L\'utilisateur a été supprimé.', 'success');
                    fetchUsers(); // Rafraîchir la liste
                } else {
                    throw new Error('Erreur lors de la suppression');
                }
            } catch (error) {
                Swal.fire('Erreur!', error.message, 'error');
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser({
            ...user,
            password: '' // Le mot de passe est vide par défaut lors de l'édition
        });
        setIsEditing(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                ...editingUser,
                ...(editingUser.password && { password: editingUser.password })
            };

            const response = await fetch(`http://localhost:8080/update/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Utilisateur mis à jour!',
                text: 'Les modifications ont été enregistrées avec succès',
                timer: 1500,
                showConfirmButton: false
            });

            setIsEditing(false);
            setEditingUser(null);
            fetchUsers(); // Rafraîchir la liste des utilisateurs

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message
            });
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <h2>Tableau de bord administrateur</h2>
            
            {!isEditing ? (
                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Nom d'utilisateur</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Modifier
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(user._id)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <form className="edit-form" onSubmit={handleUpdate}>
                    <h3>Modifier l'utilisateur</h3>
                    
                    <div className="form-group">
                        <label>Nom d'utilisateur:</label>
                        <input
                            type="text"
                            value={editingUser.username}
                            onChange={(e) => setEditingUser({
                                ...editingUser,
                                username: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({
                                ...editingUser,
                                email: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Rôle:</label>
                        <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({
                                ...editingUser,
                                role: e.target.value
                            })}
                        >
                            <option value="user">Utilisateur</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Nouveau mot de passe (optionnel):</label>
                        <input
                            type="password"
                            value={editingUser.password}
                            onChange={(e) => setEditingUser({
                                ...editingUser,
                                password: e.target.value
                            })}
                            placeholder="Laissez vide pour ne pas changer"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn">
                            Enregistrer
                        </button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => {
                                setIsEditing(false);
                                setEditingUser(null);
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

export default Dashboard;