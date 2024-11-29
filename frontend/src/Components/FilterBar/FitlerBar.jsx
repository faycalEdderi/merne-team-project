import React from 'react';
import './FilterBar.css';

const FilterBar = ({ 
    searchTerm, 
    setSearchTerm, 
    selectedCategory, 
    setSelectedCategory, 
    selectedSize, 
    setSelectedSize,
    priceRange,
    setPriceRange
}) => {
    const categoryOptions = [
        "Pulls",
        "Jeans",
        "T-shirt",
        "Manteaux",
        "Chaussures",
        "Accessoires",
        "Shorts",
        "Chemises",
        "Pantalons",
        "Cargo"
    ];

    const sizeOptions = ["S", "M", "L", "XL"];

    return (
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
                    className="filter-select"
                >
                    <option value="">Toutes les catégories</option>
                    {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Toutes les tailles</option>
                    {sizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            <div className="price-filter">
                <input
                    type="number"
                    placeholder="Prix min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({
                        ...priceRange,
                        min: e.target.value
                    })}
                    className="price-input"
                />
                <input
                    type="number"
                    placeholder="Prix max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({
                        ...priceRange,
                        max: e.target.value
                    })}
                    className="price-input"
                />
            </div>
        </div>
    );
};

export default FilterBar;
