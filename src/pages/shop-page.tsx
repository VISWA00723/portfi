import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/product-card';
import { products } from '@/data/products';
import { Product } from '@/types';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'basics', name: 'Basics' },
  { id: 'premium', name: 'Premium' },
  { id: 'limited', name: 'Limited Edition' },
  { id: 'graphic', name: 'Graphic' },
  { id: 'sustainable', name: 'Sustainable' },
];

const sortOptions = [
  { id: 'featured', name: 'Featured' },
  { id: 'newest', name: 'Newest' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
];

const ShopPage: React.FC = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    result = result.filter(
      product => 
        product.price >= priceRange[0] && 
        product.price <= priceRange[1]
    );
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      );
    }
    
    // Sort products
    switch (selectedSort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
        break;
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, selectedSort, priceRange, searchQuery]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('featured');
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Mobile filter button */}
        <div className="w-full md:hidden mb-4">
          <Button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            variant="outline"
            className="w-full flex items-center justify-between"
          >
            <span className="flex items-center">
              <Filter size={18} className="mr-2" />
              Filters
            </span>
            <ChevronDown size={18} className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {/* Sidebar filters - desktop always visible, mobile conditional */}
        <motion.aside 
          className={`w-full md:w-64 bg-white p-4 rounded-lg border border-gray-200 ${isFilterOpen ? 'block' : 'hidden md:block'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-primary-600"
            >
              Clear all
            </Button>
          </div>
          
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Price Range</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">${priceRange[0]}</span>
                <span className="text-sm text-gray-500">${priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Other potential filters */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Product Type</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">New Arrivals</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2 h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Best Sellers</span>
              </label>
            </div>
          </div>
        </motion.aside>
        
        {/* Main content */}
        <div className="flex-1">
          {/* Search and sort */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
          
          {/* Product grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
