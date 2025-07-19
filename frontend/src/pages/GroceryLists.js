import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'recipegenius_grocery_lists';

const GroceryLists = () => {
  const navigate = useNavigate();
  const [groceryLists, setGroceryLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    loadGroceryLists();
  }, []);

  const loadGroceryLists = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lists = JSON.parse(stored);
        setGroceryLists(lists);
      }
    } catch (error) {
      console.error('Error loading grocery lists from localStorage:', error);
      toast.error('Failed to load grocery lists');
    }
  };

  const saveGroceryLists = (lists) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving grocery lists to localStorage:', error);
      toast.error('Failed to save grocery lists');
    }
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      setCreating(true);
      
      const newList = {
        id: generateId(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false
      };

      const updatedLists = [newList, ...groceryLists];
      setGroceryLists(updatedLists);
      saveGroceryLists(updatedLists);
      
      setShowCreateModal(false);
      setFormData({ name: '', description: '', dueDate: '' });
      toast.success('Grocery list created successfully!');
    } catch (error) {
      console.error('Error creating grocery list:', error);
      toast.error('Failed to create grocery list');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewList = (listId) => {
    navigate(`/grocery-list/${listId}`);
  };

  const handleDeleteList = (listId) => {
    const updatedLists = groceryLists.filter(list => list.id !== listId);
    setGroceryLists(updatedLists);
    saveGroceryLists(updatedLists);
    toast.success('Grocery list deleted');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  // Add some sample data if no lists exist
  useEffect(() => {
    if (groceryLists.length === 0) {
      const sampleLists = [
        {
          id: 'sample-1',
          name: 'Weekly Shopping',
          description: 'Regular weekly groceries',
          items: [
            { id: '1', name: 'Milk', category: 'dairy', completed: false },
            { id: '2', name: 'Bread', category: 'bakery', completed: false },
            { id: '3', name: 'Apples', category: 'produce', completed: true },
          ],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCompleted: false
        },
        {
          id: 'sample-2',
          name: 'Party Supplies',
          description: 'Items for weekend party',
          items: [
            { id: '4', name: 'Chips', category: 'snacks', completed: false },
            { id: '5', name: 'Soda', category: 'beverages', completed: false },
          ],
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          isCompleted: false
        }
      ];
      setGroceryLists(sampleLists);
      saveGroceryLists(sampleLists);
    }
  }, [groceryLists.length]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Grocery Lists
          </h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New List
          </button>
        </div>
        
        {groceryLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groceryLists.map((list) => (
              <div key={list.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ListBulletIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {list.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete list"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {list.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {list.description}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-300">
                    {list.items?.length || 0} items
                    {list.items?.some(item => item.completed) && (
                      <span className="text-green-600 dark:text-green-400 ml-2">
                        ({list.items.filter(item => item.completed).length} completed)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due: {formatDate(list.dueDate)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created: {formatDate(list.createdAt)}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
                  <button 
                    onClick={() => handleViewList(list.id)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    View List
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ListBulletIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No grocery lists yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Create your first grocery list!
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Create New List
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Grocery List
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateList} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter list name..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create List'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryLists;
