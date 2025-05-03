import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CollectionBanner = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summer Collection */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-xl group"
          >
            <div className="absolute inset-0 bg-gray-900 opacity-40 group-hover:opacity-30 transition-opacity"></div>
            <img
              src="https://images.pexels.com/photos/6311162/pexels-photo-6311162.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
              alt="Summer Collection"
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h3 className="text-white text-3xl font-display font-bold mb-2">Summer Collection</h3>
              <p className="text-white text-lg mb-6">Light fabrics for those sunny days</p>
              <Link to="/shop?collection=summer">
                <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900">
                  View Collection
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Essentials Collection */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-xl group"
          >
            <div className="absolute inset-0 bg-gray-900 opacity-40 group-hover:opacity-30 transition-opacity"></div>
            <img
              src="https://images.pexels.com/photos/6348074/pexels-photo-6348074.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
              alt="Essentials Collection"
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h3 className="text-white text-3xl font-display font-bold mb-2">Essentials</h3>
              <p className="text-white text-lg mb-6">Timeless designs for everyday wear</p>
              <Link to="/shop?collection=essentials">
                <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900">
                  View Collection
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;