import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Components/Auth.css';
import Swal from 'sweetalert2';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Inscription réussie!',
                text: 'Vous pouvez maintenant vous connecter',
                timer: 2000,
                showConfirmButton: false
            });

            navigate('/login');

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Inscription</h2>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                    <label>Nom d'utilisateur:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mot de passe:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="auth-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Inscription...' : 'S\'inscrire'}
                </button>
            </form>
        </div>
    );
};

export default Register;