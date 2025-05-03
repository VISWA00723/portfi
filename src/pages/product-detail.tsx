import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Share2, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProductById } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { Size } from '@/types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProductById(id || '');
  const addToCart = useCartStore(state => state.addItem);
  
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState<Size>(product?.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      color: selectedColor,
      size: selectedSize,
      image: product.images[0],
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Images */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-gray-100 rounded-xl overflow-hidden">
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, index) => (
              <div 
                key={index}
                className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              >
                <img 
                  src={image} 
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-gray-900 mt-2">${product.price.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
          
          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Color: <span className="text-gray-500">{selectedColor}</span></h3>
            <div className="flex space-x-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-primary-500' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} color`}
                >
                  {selectedColor === color && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Size Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Size: <span className="text-gray-500">{selectedSize}</span></h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                    selectedSize === size 
                      ? 'border-primary-500 bg-primary-50 text-primary-600' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Quantity</h3>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                -
              </button>
              <div className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <div className="flex space-x-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3"
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <Check size={18} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Add to Cart
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="p-3"
              aria-label="Add to wishlist"
            >
              <Heart size={18} />
            </Button>
            
            <Button
              variant="outline"
              className="p-3"
              aria-label="Share product"
            >
              <Share2 size={18} />
            </Button>
          </div>
          
          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Product Details</h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>100% premium cotton</li>
                <li>Pre-shrunk to minimize shrinkage</li>
                <li>Machine washable</li>
                <li>Designed and printed in the USA</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700">Shipping & Returns</h3>
              <p className="mt-2 text-sm text-gray-600">
                Free shipping on orders over $50. Easy returns within 30 days.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
