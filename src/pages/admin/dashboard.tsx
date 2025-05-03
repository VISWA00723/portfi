import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, DollarSign, TrendingUp, Plus, Trash2, Edit, Search } from 'lucide-react';
import { mongodb, MongoDBProduct, dbEvents, MongoDBOrder } from '@/lib/mongodb';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [] as MongoDBOrder[],
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productList, setProductList] = useState<MongoDBProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<MongoDBProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchStats();
    fetchProducts();

    // Set up real-time event listeners
    dbEvents.on('productCreated', handleProductCreated);
    dbEvents.on('productUpdated', handleProductUpdated);
    dbEvents.on('productDeleted', handleProductDeleted);
    dbEvents.on('orderCreated', handleOrderCreated);
    dbEvents.on('orderUpdated', handleOrderUpdated);

    // Clean up event listeners
    return () => {
      dbEvents.off('productCreated', handleProductCreated);
      dbEvents.off('productUpdated', handleProductUpdated);
      dbEvents.off('productDeleted', handleProductDeleted);
      dbEvents.off('orderCreated', handleOrderCreated);
      dbEvents.off('orderUpdated', handleOrderUpdated);
    };
  }, []);

  // Event handlers for real-time updates
  const handleProductCreated = (product: MongoDBProduct) => {
    setProductList(prevProducts => [...prevProducts, product]);
  };

  const handleProductUpdated = (product: MongoDBProduct) => {
    setProductList(prevProducts => 
      prevProducts.map(p => p._id === product._id ? product : p)
    );
  };

  const handleProductDeleted = (product: MongoDBProduct) => {
    setProductList(prevProducts => 
      prevProducts.filter(p => p._id !== product._id)
    );
  };

  const handleOrderCreated = () => {
    fetchStats();
  };

  const handleOrderUpdated = () => {
    fetchStats();
  };

  async function fetchStats() {
    try {
      // Fetch users
      const users = await mongodb.users.find({});
      
      // Fetch orders
      const orders = await mongodb.orders.find({});
      
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
      
      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders: orders.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchProducts() {
    try {
      const products = await mongodb.products.find({});
      setProductList(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = productList.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await mongodb.products.deleteOne({ _id: id });
        // The product list will be updated via the event listener
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEditProduct = (product: MongoDBProduct) => {
    setEditingProduct(product);
    setActiveTab('editProduct');
  };

  const handleAddProduct = async (product: Partial<MongoDBProduct>) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const newProduct = {
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        images: product.images || ['https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'],
        colors: product.colors || ['#000000'],
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        category: product.category || '',
        featured: product.featured || false,
        bestSeller: product.bestSeller || false,
        new: product.new || true,
        stock: product.stock || 0,
      };
      
      await mongodb.products.insertOne(newProduct);
      // The product list will be updated via the event listener
      
      setActiveTab('products');
    } catch (error) {
      console.error('Error adding product:', error);
      setErrorMessage('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (product: MongoDBProduct) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await mongodb.products.updateOne(
        { _id: product._id },
        { $set: product }
      );
      
      // The product list will be updated via the event listener
      
      setActiveTab('products');
    } catch (error) {
      console.error('Error updating product:', error);
      setErrorMessage('Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-semibold">{stats.totalUsers}</h3>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-semibold">{stats.totalOrders}</h3>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <ShoppingBag className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <h3 className="text-2xl font-semibold">
                ${stats.totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Growth</p>
              <h3 className="text-2xl font-semibold">+12%</h3>
            </div>
            <div className="bg-accent-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-accent-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentMethod === 'stripe' ? 'Stripe' : 'Other'} - {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderProducts = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <Button 
            onClick={() => setActiveTab('addProduct')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.images[0]} alt={product.name} className="h-12 w-12 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.featured ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductForm = (isEditing = false) => {
    const [formData, setFormData] = useState<Partial<MongoDBProduct>>(
      isEditing && editingProduct
        ? { ...editingProduct }
        : {
            name: '',
            description: '',
            price: 0,
            images: ['https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'],
            colors: ['#000000'],
            sizes: ['S', 'M', 'L', 'XL'],
            category: '',
            featured: false,
            bestSeller: false,
            new: true,
            stock: 0,
            createdAt: new Date(),
          }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
      } else if (name === 'price' || name === 'stock') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isEditing && editingProduct) {
        handleUpdateProduct(formData as MongoDBProduct);
      } else {
        handleAddProduct(formData);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.category || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="t-shirts">T-Shirts</option>
                <option value="hoodies">Hoodies</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.price || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.stock || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.description || ''}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.images?.[0] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, images: [e.target.value] }))}
              required
            />
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.featured || false}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured Product
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bestSeller"
                name="bestSeller"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.bestSeller || false}
                onChange={(e) => setFormData(prev => ({ ...prev, bestSeller: e.target.checked }))}
              />
              <label htmlFor="bestSeller" className="ml-2 block text-sm text-gray-900">
                Best Seller
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new"
                name="new"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.new || false}
                onChange={(e) => setFormData(prev => ({ ...prev, new: e.target.checked }))}
              />
              <label htmlFor="new" className="ml-2 block text-sm text-gray-900">
                New Arrival
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => setActiveTab('products')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/" className="text-primary-600 hover:text-primary-800">
          Back to Store
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'products' || activeTab === 'addProduct' || activeTab === 'editProduct'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customers
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'addProduct' && renderProductForm()}
      {activeTab === 'editProduct' && renderProductForm(true)}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Orders</h2>
          <p className="text-gray-500">Order management coming soon.</p>
        </div>
      )}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Customers</h2>
          <p className="text-gray-500">Customer management coming soon.</p>
        </div>
      )}
    </div>
  );
}