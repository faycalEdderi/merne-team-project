const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Whey', 'Gainer', 'Creatine', 'BCAA']
    },
    images: [{
        type: String,
        required: true
    }],
    mainImage: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Middleware pour définir l'image principale si elle n'est pas définie
productSchema.pre('save', function(next) {
    if (this.images.length > 0 && !this.mainImage) {
        this.mainImage = this.images[0];
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;