import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import Swal from 'sweetalert2';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './Index.css';
import { jwtDecode } from "jwt-decode";


const Index = () => {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Whey',
        images: [],
        mainImage: ''
    });
    const [userId, setUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);
            } catch (error) {
                console.error('Erreur de décodage du token:', error);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch('http://localhost:8080/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                setIsAdmin(data.role === 'admin');
            } catch (error) {
                console.error('Erreur:', error);
            }
        };
        checkAdminStatus();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8080/products', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du produit');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Produit ajouté avec succès!',
                showConfirmButton: false,
                timer: 1500
            });

            setShowForm(false);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: 'Whey',
                images: [],
                mainImage: ''
            });
            fetchProducts();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message
            });
        }
    };

    const handleImageChange = (e) => {
        const urls = e.target.value.split(',').map(url => url.trim());
        setFormData({
            ...formData,
            images: urls,
            mainImage: urls[0] || ''
        });
    };

    const toggleDescription = (productId) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const handleEdit = async (product) => {
        try {
            const { value: formValues } = await Swal.fire({
                title: 'Modifier le produit',
                html: `
                    <div class="swal2-input-group">
                        <label for="swal-name">Nom</label>
                        <input id="swal-name" class="swal2-input" value="${product.name}">
                    </div>
                    <div class="swal2-input-group">
                        <label for="swal-price">Prix</label>
                        <input id="swal-price" class="swal2-input" type="number" step="0.01" value="${product.price}">
                    </div>
                    <div class="swal2-input-group">
                        <label for="swal-stock">Stock</label>
                        <input id="swal-stock" class="swal2-input" type="number" value="${product.stock}">
                    </div>
                    <div class="swal2-input-group">
                        <label for="swal-description">Description</label>
                        <textarea id="swal-description" class="swal2-textarea">${product.description}</textarea>
                    </div>
                    <div class="swal2-input-group">
                        <label for="swal-category">Catégorie</label>
                        <select id="swal-category" class="swal2-select">
                            <option value="Whey" ${product.category === 'Whey' ? 'selected' : ''}>Whey</option>
                            <option value="Gainer" ${product.category === 'Gainer' ? 'selected' : ''}>Gainer</option>
                            <option value="Creatine" ${product.category === 'Creatine' ? 'selected' : ''}>Créatine</option>
                            <option value="BCAA" ${product.category === 'BCAA' ? 'selected' : ''}>BCAA</option>
                        </select>
                    </div>
                    <div class="swal2-input-group">
                        <label for="swal-images">URLs des images (séparées par des virgules)</label>
                        <input id="swal-images" class="swal2-input" value="${product.images.join(', ')}">
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Modifier',
                cancelButtonText: 'Annuler',
                preConfirm: () => {
                    const name = document.getElementById('swal-name').value;
                    const price = document.getElementById('swal-price').value;
                    const stock = document.getElementById('swal-stock').value;
                    const description = document.getElementById('swal-description').value;
                    const category = document.getElementById('swal-category').value;
                    const images = document.getElementById('swal-images').value
                        .split(',')
                        .map(url => url.trim())
                        .filter(url => url !== '');

                    if (!name || !price || !stock || !description || !category || images.length === 0) {
                        Swal.showValidationMessage('Tous les champs sont requis');
                        return false;
                    }

                    return {
                        name,
                        description,
                        price: parseFloat(price),
                        stock: parseInt(stock),
                        category,
                        images,
                        mainImage: images[0]
                    };
                },
                customClass: {
                    input: 'my-swal-input',
                    textarea: 'my-swal-textarea',
                    select: 'my-swal-select'
                }
            });

            if (formValues) {
                const response = await fetch(`http://localhost:8080/products/${product._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(formValues)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Erreur lors de la modification');
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Produit modifié avec succès',
                    timer: 1500,
                    showConfirmButton: false
                });

                fetchProducts(); // Rafraîchir la liste
            }
        } catch (error) {
            console.error('Erreur:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message
            });
        }
    };

    const handleDelete = async (productId) => {
        try {
            const result = await Swal.fire({
                title: 'Êtes-vous sûr?',
                text: "Cette action est irréversible!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Oui, supprimer!',
                cancelButtonText: 'Annuler'
            });

            if (result.isConfirmed) {
                const response = await fetch(`http://localhost:8080/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }

                await Swal.fire(
                    'Supprimé!',
                    'Le produit a été supprimé.',
                    'success'
                );

                fetchProducts(); // Rafraîchir la liste
            }
        } catch (error) {
            Swal.fire(
                'Erreur!',
                error.message,
                'error'
            );
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) &&
                           (!priceRange.max || product.price <= Number(priceRange.max));
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    return (
        <div className="index-container">
            <button 
                className="add-product-btn"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Annuler' : 'Ajouter un produit'}
            </button>

            {showForm && (
                <form className="product-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nom du produit:</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Prix:</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="form-group">
                            <label>Stock:</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Catégorie:</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            required
                        >
                            <option value="Whey">Whey</option>
                            <option value="Gainer">Gainer</option>
                            <option value="Creatine">Créatine</option>
                            <option value="BCAA">BCAA</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>URLs des images (séparées par des virgules):</label>
                        <input
                            type="text"
                            onChange={handleImageChange}
                            placeholder="http://image1.jpg, http://image2.jpg"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Ajouter le produit
                    </button>
                </form>
            )}

            <div className="filters-container">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-filter"
                    >
                        <option value="">Toutes les catégories</option>
                        <option value="Whey">Whey</option>
                        <option value="Gainer">Gainer</option>
                        <option value="Creatine">Créatine</option>
                        <option value="BCAA">BCAA</option>
                    </select>
                </div>

                <div className="price-filter">
                    <input
                        type="number"
                        placeholder="Prix min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="price-input"
                    />
                    <input
                        type="number"
                        placeholder="Prix max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="price-input"
                    />
                </div>
            </div>

            <div className="products-container">
                <h2>Nos Produits</h2>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={3}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                        320: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 }
                    }}
                >
                    {filteredProducts.map((product) => (
                        <SwiperSlide key={product._id}>
                            <div className="product-card">
                                <div className="image-gallery">
                                    <img 
                                        src={product.mainImage || product.images[0]} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'chemin/vers/image/par/defaut.jpg'
                                        }}
                                    />
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="category">Catégorie : {product.category}</p>
                                    
                                    <div className="description-container">
                                        <p className={`description ${expandedDescriptions[product._id] ? 'expanded' : ''}`}>
                                            {product.description}
                                        </p>
                                        <button 
                                            className="description-toggle"
                                            onClick={() => toggleDescription(product._id)}
                                        >
                                            {expandedDescriptions[product._id] ? 'Voir moins' : 'Voir plus'}
                                        </button>
                                    </div>

                                    <p className="price">{product.price}€</p>
                                    <p className="stock">Stock: {product.stock}</p>
                                    
                                    {isAdmin && product.owner && (
                                        <p className="owner">Ajouté par: {product.owner.username}</p>
                                    )}

                                    <div className="product-actions">
                                        {(isAdmin || (product.owner && (product.owner._id === userId))) && (
                                            <>
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Modifier
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(product._id)}
                                                >
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default Index;