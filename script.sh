#!/bin/bash

# Vérification de la présence de npm
if ! [ -x "$(command -v npm)" ]; then
    echo "Erreur : npm n'est pas installé." >&2
    exit 1
fi

# Installation des dépendances backend
echo "Installation des dépendances pour le backend..."
cd BackEnd
npm install
npm i cors dotenv
cd ..

# Installation des dépendances frontend
echo "Installation des dépendances pour le frontend..."
cd frontend
npm install
cd ..

echo "Installation des dépendances terminée !"
