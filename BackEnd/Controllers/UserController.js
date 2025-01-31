// user controller to register with bcyptjs, login, update user, delete user
const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const registerUser = async (req, res) => {
    try {
        console.log(req.body);
        if (!req.body.password) {
            return res
                .status(400)
                .send({ error: "Le mot de passe est requis" });
        }

        // Vérification de la confirmation du mot de passe
        if (req.body.password !== req.body.confirmPassword) {
            return res
                .status(400)
                .send({ error: "Les mots de passe ne correspondent pas" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // On retire confirmPassword avant de créer l'utilisateur
        const { confirmPassword, ...userData } = req.body;

        const user = new User({
            ...userData,
            password: hashedPassword,
        });

        await user.save();

        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: "Erreur lors de la creation du compte." });
    }
};

const loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(401).send({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email }, // Payload
            process.env.JWT_SECRET, // Secret key
            { expiresIn: process.env.JWT_EXPIRES_IN } // Options
        );

        res.status(200).send({ message: "Login successful", token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).send({ error: "Utilisateur non trouvé" });
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(401).send({ error: "Non autorisé" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updates = {};
        if (req.body.username) updates.username = req.body.username;
        if (req.body.email) updates.email = req.body.email;

        if (req.body.password) {
            // Récupérer l'utilisateur de la base de données
            const user = await User.findById(decoded.id);
            if (!user) {
                return res
                    .status(404)
                    .send({ error: "Utilisateur non trouvé" });
            }

            // Vérifier que "oldPassword" est identique à celui en bdd
            const isMatch = await bcrypt.compare(
                req.body.oldPassword,
                user.password
            );
            if (!isMatch) {
                return res
                    .status(400)
                    .send({ error: "Ancien mot de passe incorrect" });
            }

            // Vérifier que "oldPassword" est différent de "password"
            if (req.body.password === req.body.oldPassword) {
                return res
                    .status(400)
                    .send({ error: "Les mots de passe sont identiques" });
            }

            // Mettre à jour le mot de passe
            updates.password = await bcrypt.hash(req.body.password, 10);
        }
        const user = await User.findByIdAndUpdate(decoded.id, updates, {
            new: true,
        }).select("-password");

        if (!user) {
            return res.status(404).send({ error: "Utilisateur non trouvé" });
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const adminUser = await User.findById(decoded.id);
        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).send({
                error: "Accès non autorisé. Réservé aux administrateurs.",
            });
        }

        // Récupérer tous les utilisateurs sauf le mot de passe
        const users = await User.find({}).select("-password");
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
};
