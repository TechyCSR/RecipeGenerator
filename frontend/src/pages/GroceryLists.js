import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  ListBulletIcon, 
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { groceryApi } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const GroceryLists = () => {
  const navigate = useNavigate();
  const [groceryLists, setGroceryLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchGroceryLists();
  }, []);

  const fetchGroceryLists = async () => {
    try {
      setLoading(true);
      const response = await groceryApi.getAll();
      setGroceryLists(response.data || []);
    } catch (error) {
      console.error('Error fetching grocery lists:', error);
      toast.error('Failed to load grocery lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      setCreating(true);
      const listData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null
      };
      
      const response = await groceryApi.create(listData);
      
      if (response.success) {
        toast.success('Grocery list created successfully!');
        setGroceryLists(prev => [response.data, ...prev]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', dueDate: '' });
      }
    } catch (error) {
      console.error('Error creating grocery list:', error);
      toast.error('Failed to create grocery list');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateList = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingList) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      setCreating(true);
      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null
      };
      
      const response = await groceryApi.update(editingList._id, updates);
      
      if (response.success) {
        toast.success('Grocery list updated successfully!');
        setGroceryLists(prev => 
          prev.map(list => 
            list._id === editingList._id ? response.data : list
          )
        );
        setEditingList(null);
        setFormData({ name: '', description: '', dueDate: '' });
      }
    } catch (error) {
      console.error('Error updating grocery list:', error);
      toast.error('Failed to update grocery list');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`Are you sure you want to delete "${listName}"?`)) {
      return;
    }

    try {
      const response = await groceryApi.delete(listId);
      
      if (response.success) {
        toast.success('Grocery list deleted successfully!');
        setGroceryLists(prev => prev.filter(list => list._id !== listId));
      }
    } catch (error) {
      console.error('Error deleting grocery list:', error);
      toast.error('Failed to delete grocery list');
    }
  };

  const handleViewList = (listId) => {
    navigate(`/grocery-list/${listId}`);
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      dueDate: list.dueDate ? new Date(list.dueDate).toISOString().split('T')[0] : ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getItemCount = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Grocery Lists
          </h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5" />
            New List
          </button>
        </div>
        
        {groceryLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groceryLists.map((list) => {
              const itemCount = getItemCount(list.items);
              const daysUntilDue = getDaysUntilDue(list.dueDate);
              
              return (
                <div key={list._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <ListBulletIcon className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {list.name}
                        </h3>
                        {list.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {list.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditList(list)}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                        title="Edit list"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list._id, list.name)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Delete list"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <ListBulletIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Created: {formatDate(list.createdAt)}
                      </span>
                    </div>
                    
                    {list.dueDate && (
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                        <span className={`text-sm ${
                          daysUntilDue < 0 
                            ? 'text-red-500' 
                            : daysUntilDue <= 2 
                            ? 'text-yellow-500' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          Due: {formatDate(list.dueDate)}
                          {daysUntilDue < 0 && ' (Overdue)'}
                          {daysUntilDue === 0 && ' (Today)'}
                          {daysUntilDue === 1 && ' (Tomorrow)'}
                          {daysUntilDue > 1 && ` (${daysUntilDue} days)`}
                        </span>
                      </div>
                    )}
                    
                    {list.isCompleted && (
                      <div className="inline-block bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                        Completed
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => handleViewList(list._id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                    >
                      View List
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ListBulletIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No grocery lists yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Create your first grocery list!
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5" />
              Create New List
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingList) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingList ? 'Edit Grocery List' : 'Create New Grocery List'}
            </h2>
            
            <form onSubmit={editingList ? handleUpdateList : handleCreateList}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter list name..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter description..."
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingList(null);
                    setFormData({ name: '', description: '', dueDate: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {creating ? 'Saving...' : editingList ? 'Update List' : 'Create List'}
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
