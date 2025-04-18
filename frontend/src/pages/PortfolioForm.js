import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortfolio, getPortfolio, updatePortfolio } from '../services/api';

const PortfolioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchPortfolio();
    }
  }, [isEditing]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const portfolio = await getPortfolio(id);
      setName(portfolio.name);
    } catch (error) {
      console.error('Error fetching portfolio', error);
      setError('Failed to load portfolio. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Portfolio name is required');
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await updatePortfolio(id, name);
      } else {
        await createPortfolio(name);
      }
      navigate('/portfolios');
    } catch (error) {
      console.error('Error saving portfolio', error);
      setError('Failed to save portfolio. Please try again later.');
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="text-center py-10">
        <div className="spinner"></div>
        <p className="mt-2 text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-lg leading-6 font-medium text-gray-900">
            {isEditing ? 'Edit Portfolio' : 'Create Portfolio'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isEditing ? 'Update your portfolio details' : 'Create a new portfolio to track your investments'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Portfolio Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="My Investment Portfolio"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/portfolios')}
              className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioForm;