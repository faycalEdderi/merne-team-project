const Product = require('../Models/ProductModel');
const User = require('../Models/UserModel');
const jwt = require('jsonwebtoken');

const ProductController = {
    // Créer un nouveau produit (accessible à tous les utilisateurs connectés)
    createProduct: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const product = new Product({
                ...req.body,
                owner: decoded.id
            });

            await product.save();
            res.status(201).send(product);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    },

    // Obtenir tous les produits (différent selon le rôle)
    getAllProducts: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id);
            
            let products;
            if (user.role === 'admin') {
                // Admin voit tous les produits avec les détails des propriétaires
                products = await Product.find().populate('owner', 'username email');
            } else {
                // Utilisateur normal ne voit que ses produits
                products = await Product.find({ owner: decoded.id });
            }
            
            res.status(200).send(products);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    },

    // Obtenir les produits par catégorie (différent selon le rôle)
    getProductsByCategory: async (req, res) => {
        try {
            const { category } = req.params;
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id);
            
            let products;
            if (user.role === 'admin') {
                products = await Product.find({ category }).populate('owner', 'username email');
            } else {
                products = await Product.find({ category, owner: decoded.id });
            }
            
            res.status(200).send(products);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    },

    // Obtenir un produit par ID
    getProductById: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id);
            const product = await Product.findById(req.params.id).populate('owner', 'username email');
            
            if (!product) {
                return res.status(404).send({ error: "Produit non trouvé" });
            }

            // Vérifier si l'utilisateur est admin ou propriétaire du produit
            if (user.role !== 'admin' && product.owner._id.toString() !== decoded.id) {
                return res.status(403).send({ error: "Accès non autorisé" });
            }
            
            res.status(200).send(product);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    },

    // Mettre à jour un produit
    updateProduct: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Trouver le produit
            const product = await Product.findById(req.params.id);
            
            if (!product) {
                return res.status(404).send({ error: "Produit non trouvé" });
            }

            // Vérifier si l'utilisateur est admin ou propriétaire
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).send({ error: "Utilisateur non trouvé" });
            }

            if (user.role !== 'admin' && product.owner.toString() !== decoded.id) {
                return res.status(403).send({ error: "Non autorisé" });
            }

            // Mettre à jour le produit
            const updates = Object.keys(req.body);
            const allowedUpdates = ['name', 'description', 'price', 'stock', 'category', 'images', 'mainImage'];
            
            const isValidOperation = updates.every(update => allowedUpdates.includes(update));
            if (!isValidOperation) {
                return res.status(400).send({ error: 'Mises à jour invalides' });
            }

            // Appliquer les mises à jour
            updates.forEach(update => product[update] = req.body[update]);
            await product.save();

            res.status(200).send(product);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    },

    // Supprimer un produit
    deleteProduct: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id);
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).send({ error: "Produit non trouvé" });
            }

            // Vérifier si l'utilisateur est admin ou propriétaire du produit
            if (user.role !== 'admin' && product.owner.toString() !== decoded.id) {
                return res.status(403).send({ error: "Accès non autorisé" });
            }

            await Product.findByIdAndDelete(req.params.id);
            res.status(200).send({ message: "Produit supprimé avec succès" });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    },

    // Mettre à jour le stock
    updateStock: async (req, res) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id);
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).send({ error: "Produit non trouvé" });
            }

            // Vérifier si l'utilisateur est admin ou propriétaire du produit
            if (user.role !== 'admin' && product.owner.toString() !== decoded.id) {
                return res.status(403).send({ error: "Accès non autorisé" });
            }

            product.stock = req.body.stock;
            await product.save();

            res.status(200).send(product);
        } catch (error) {
            res.status(400).send({ error: error.message });
        }
    }
};

module.exports = ProductController;