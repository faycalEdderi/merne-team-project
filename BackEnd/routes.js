const express = require('express');
const router = express.Router();

// Import des contrôleurs
const { 
    registerUser, 
    loginUser, 
    updateUser, 
    deleteUser, 
    getUserProfile,
    updateUserProfile,
    getAllUsers
} = require('./Controllers/UserController');

const { 
    createProduct, 
    getAllProducts, 
    getProductsByCategory,
    getProductById, 
    updateProduct, 
    deleteProduct,
    updateStock
} = require('./Controllers/ProductController');

// Routes utilisateurs
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.get("/users", getAllUsers);

// Routes des produits
router.post("/products", createProduct);
router.get("/products", getAllProducts);
router.get("/products/category/:category", getProductsByCategory);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/stock", updateStock);

module.exports = router;