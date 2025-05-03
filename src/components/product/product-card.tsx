import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addToCart = useCartStore(state => state.addItem);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      color: product.colors[0],
      size: product.sizes[0],
      image: product.images[0],
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-4 aspect-[3/4]">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* New Tag */}
          {product.new && (
            <div className="absolute top-2 right-2 bg-accent-600 text-white text-xs font-semibold px-2 py-1 rounded">
              NEW
            </div>
          )}
          
          {/* Quick Action Buttons - Only visible on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2">
              <Button
                onClick={handleAddToCart}
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary-300"
                aria-label="Add to cart"
              >
                <ShoppingCart size={20} />
              </Button>
              
              <Link to={`/product/${product.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-primary-300"
                  aria-label="Quick view"
                >
                  <Eye size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-gray-900 font-semibold">
            {formatPrice(product.price)}
          </p>
          
          {/* Color Options */}
          <div className="mt-2 flex gap-1">
            {product.colors.slice(0, 3).map((color) => (
              <div 
                key={color} 
                className="w-3 h-3 rounded-full border border-gray-300" 
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {product.colors.length > 3 && (
              <div className="text-xs text-gray-500">+{product.colors.length - 3}</div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;