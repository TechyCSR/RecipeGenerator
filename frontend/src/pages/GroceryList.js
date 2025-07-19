import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'recipegenius_grocery_lists';

const GroceryList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    loadGroceryList();
  }, [id]);

  const loadGroceryList = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lists = JSON.parse(stored);
        const foundList = lists.find(l => l.id === id);
        setList(foundList || null);
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
      toast.error('Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const saveGroceryLists = (lists) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving grocery lists:', error);
      toast.error('Failed to save changes');
    }
  };

  const toggleItemComplete = (itemId) => {
    if (!list) return;

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };

    setList(updatedList);

    // Update in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const lists = JSON.parse(stored);
      const updatedLists = lists.map(l =>
        l.id === id ? updatedList : l
      );
      saveGroceryLists(updatedLists);
    }
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !list) return;

    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: 'other',
      completed: false
    };

    const updatedList = {
      ...list,
      items: [...list.items, newItem],
      updatedAt: new Date().toISOString()
    };

    setList(updatedList);
    setNewItemName('');

    // Update in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const lists = JSON.parse(stored);
      const updatedLists = lists.map(l =>
        l.id === id ? updatedList : l
      );
      saveGroceryLists(updatedLists);
    }

    toast.success('Item added!');
  };

  const removeItem = (itemId) => {
    if (!list) return;

    const updatedItems = list.items.filter(item => item.id !== itemId);
    const updatedList = {
      ...list,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };

    setList(updatedList);

    // Update in localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const lists = JSON.parse(stored);
      const updatedLists = lists.map(l =>
        l.id === id ? updatedList : l
      );
      saveGroceryLists(updatedLists);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            Grocery list not found
          </p>
          <button 
            onClick={() => navigate('/grocery-lists')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Lists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Grocery List {id}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Shopping List
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-gray-700 dark:text-gray-300">
                Sample grocery item 1
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-gray-700 dark:text-gray-300">
                Sample grocery item 2
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-gray-700 dark:text-gray-300">
                Sample grocery item 3
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryList;
