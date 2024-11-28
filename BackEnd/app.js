const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

const PORT = 8080;

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/MuscleHub", {})
  .then(() => console.log("Connected to MongoDB"));

const routes = require("./routes");
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
