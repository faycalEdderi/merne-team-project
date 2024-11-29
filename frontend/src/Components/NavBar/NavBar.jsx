import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const token = localStorage.getItem('token');

    const checkUserRole = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setIsAdmin(data.role === 'admin');
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            checkUserRole();
        }
    }, [token, checkUserRole]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">MuscleHub</Link>
            </div>
            <div className="navbar-menu">
                {token ? (
                    <>
                        {isAdmin && (
                            <Link to="/dashboard" className="nav-link">
                                Dashboard
                            </Link>
                        )}
                        <Link to="/profile" className="nav-link">
                            Mon Profil
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Connexion</Link>
                        <Link to="/register" className="nav-link">Inscription</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;