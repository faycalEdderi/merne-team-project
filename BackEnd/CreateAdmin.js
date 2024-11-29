const mongoose = require("mongoose");
const User = require("./Models/UserModel");
const bcrypt = require("bcrypt");

async function createDefaultAdmin() {
    try {
        const adminExists = await User.findOne({ role: "admin" });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            const admin = new User({
                username: "admin",
                email: "admin@gmail.com",
                password: hashedPassword,
                role: "admin",
            });

            await admin.save();
            console.log("Admin par défaut créé avec succès !");
        } else {
            console.log("Un admin existe déjà.");
        }
    } catch (error) {
        console.error(
            "Erreur lors de la création de l'admin par défaut :",
            error
        );
    }
}

module.exports = createDefaultAdmin;
