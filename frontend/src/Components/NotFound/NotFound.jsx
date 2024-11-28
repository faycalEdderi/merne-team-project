import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404</h1>
            <h2>Page Non Trouvée</h2>
            <p>Désolé, la page que vous recherchez n'existe pas.</p>
            <Link to="/" className="home-link">
                Retour à l'accueil
            </Link>
        </div>
    );
};

export default NotFound;