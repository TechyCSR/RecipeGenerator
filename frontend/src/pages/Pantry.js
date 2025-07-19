import React, { useState, useEffect } from 'react';
import { PlusIcon, ArchiveBoxIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'recipegenius_pantry_items';

const Pantry = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: 'Other',
    expiry: ''
  });

  const categories = [
    'Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Spices', 
    'Canned Goods', 'Frozen', 'Baking', 'Cooking', 'Beverages', 'Other'
  ];

  useEffect(() => {
    loadPantryItems();
  }, []);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const loadPantryItems = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPantryItems(JSON.parse(stored));
      } else {
        // Initialize with sample data
        const sampleItems = [
          { 
            id: generateId(), 
            name: 'Flour', 
            quantity: '2 lbs', 
            category: 'Baking', 
            expiry: '2024-06-01',
            addedAt: new Date().toISOString()
          },
          { 
            id: generateId(), 
            name: 'Olive Oil', 
            quantity: '1 bottle', 
            category: 'Cooking', 
            expiry: '2024-12-01',
            addedAt: new Date().toISOString()
          },
          { 
            id: generateId(), 
            name: 'Rice', 
            quantity: '5 lbs', 
            category: 'Grains', 
            expiry: '2025-01-01',
            addedAt: new Date().toISOString()
          },
        ];
        setPantryItems(sampleItems);
        savePantryItems(sampleItems);
      }
    } catch (error) {
      console.error('Error loading pantry items:', error);
      toast.error('Failed to load pantry items');
    }
  };

  const savePantryItems = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving pantry items:', error);
      toast.error('Failed to save pantry items');
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quantity.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newItem = {
      id: generateId(),
      name: formData.name.trim(),
      quantity: formData.quantity.trim(),
      category: formData.category,
      expiry: formData.expiry,
      addedAt: new Date().toISOString()
    };

    const updatedItems = [...pantryItems, newItem];
    setPantryItems(updatedItems);
    savePantryItems(updatedItems);
    
    // Reset form
    setFormData({ name: '', quantity: '', category: 'Other', expiry: '' });
    setShowAddModal(false);
    toast.success('Item added to pantry!');
  };

  const handleEditItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quantity.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedItems = pantryItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.name.trim(),
            quantity: formData.quantity.trim(),
            category: formData.category,
            expiry: formData.expiry,
            updatedAt: new Date().toISOString()
          }
        : item
    );

    setPantryItems(updatedItems);
    savePantryItems(updatedItems);
    
    // Reset form
    setFormData({ name: '', quantity: '', category: 'Other', expiry: '' });
    setEditingItem(null);
    toast.success('Item updated!');
  };

  const handleDeleteItem = (id) => {
    const updatedItems = pantryItems.filter(item => item.id !== id);
    setPantryItems(updatedItems);
    savePantryItems(updatedItems);
    toast.success('Item removed from pantry');
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      expiry: item.expiry
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({ name: '', quantity: '', category: 'Other', expiry: '' });
  };

  const isExpiringSoon = (expiry) => {
    if (!expiry) return false;
    const expiryDate = new Date(expiry);
    const today = new Date();
    const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff >= 0;
  };

  const isExpired = (expiry) => {
    if (!expiry) return false;
    const expiryDate = new Date(expiry);
    const today = new Date();
    return expiryDate < today;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pantry
          </h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Item
          </button>
        </div>
        
        {pantryItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pantryItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ArchiveBoxIcon className="h-8 w-8 text-green-500 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {item.name}
                    </h3>
                  </div>
                  {(isExpired(item.expiry) || isExpiringSoon(item.expiry)) && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isExpired(item.expiry) 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {isExpired(item.expiry) ? 'Expired' : 'Expiring Soon'}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Quantity:</span> {item.quantity}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Category:</span> {item.category}
                  </p>
                  {item.expiry && (
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Expires:</span> {item.expiry}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <button 
                    onClick={() => startEdit(item)}
                    className="text-blue-500 hover:text-blue-600 font-medium flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Your pantry is empty
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              Add items to track your ingredients!
            </p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || editingItem) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={editingItem ? handleEditItem : handleAddItem} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Chicken Breast"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 2 lbs, 1 bottle"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pantry;
