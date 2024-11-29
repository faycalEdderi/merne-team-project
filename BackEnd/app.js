const express = require("express");
const cors = require("cors");
const app = express();
const createDefaultAdmin = require("./CreateAdmin");

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());

const PORT = 8080;

const mongoose = require("mongoose");
mongoose
    .connect("mongodb://localhost:27017/Baz'Art_Model", {})
    .then(async () => {
        console.log("Connecté à MongoDB !");

        // Crée l'admin par défaut si nécessaire
        await createDefaultAdmin();
    });

const routes = require("./routes");
app.use("/", routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
