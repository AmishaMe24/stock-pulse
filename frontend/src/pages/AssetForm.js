import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addAsset, updateAsset, getStockQuote, searchStocks } from '../services/api';

const AssetForm = () => {
  const { portfolioId, assetId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    symbol: '',
    asset_type: 'stock',
    quantity: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  
  const isEditing = !!assetId;

  useEffect(() => {
    if (isEditing) {
      // TODO: Fetch asset details for editing
      // This would require an API endpoint to get a single asset
    }
  }, [isEditing, assetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If symbol changes, reset current price
    if (name === 'symbol') {
      setCurrentPrice(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stocks', error);
      setError('Failed to search for stocks. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectStock = (stock) => {
    setFormData({
      ...formData,
      symbol: stock['1. symbol'],
      asset_type: 'stock'
    });
    setSearchResults([]);
    setSearchQuery('');
    fetchCurrentPrice(stock['1. symbol']);
  };

  const fetchCurrentPrice = async (symbol) => {
    try {
      setFetchingPrice(true);
      const quote = await getStockQuote(symbol);
      if (quote) {
        setCurrentPrice(parseFloat(quote['05. price']));
        setFormData({
          ...formData,
          symbol,
          purchase_price: parseFloat(quote['05. price']).toFixed(2)
        });
      }
    } catch (error) {
      console.error('Error fetching stock price', error);
      setError('Failed to fetch current price. Please enter manually.');
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.symbol || !formData.quantity || !formData.purchase_price) {
      setError('Please fill in all required fields');
      return;
    }

    // Convert string values to numbers
    const assetData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      purchase_price: parseFloat(formData.purchase_price)
    };

    try {
      setLoading(true);
      if (isEditing) {
        await updateAsset(assetId, assetData);
        navigate(`/portfolios/${portfolioId}`);
      } else {
        await addAsset(portfolioId, assetData);
        navigate(`/portfolios/${portfolioId}`);
      }
    } catch (error) {
      console.error('Error saving asset', error);
      setError('Failed to save asset. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-lg leading-6 font-medium text-gray-900">
            {isEditing ? 'Edit Asset' : 'Add Asset to Portfolio'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isEditing ? 'Update your asset details' : 'Add a new asset to your portfolio'}
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
        <div className="px-4 py-5 sm:p-6">
          {/* Stock Search */}
          {!isEditing && (
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search for a stock
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                  placeholder="Enter company name or symbol"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white shadow overflow-hidden border border-gray-200 sm:rounded-md max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {searchResults.map((stock) => (
                      <li key={stock['1. symbol']}>
                        <button
                          type="button"
                          onClick={() => selectStock(stock)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-indigo-600">{stock['1. symbol']}</div>
                            <div className="text-sm text-gray-500">{stock['2. name']}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                  Symbol *
                </label>
                <input
                  type="text"
                  name="symbol"
                  id="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                  readOnly={!!searchResults.length}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700">
                  Asset Type *
                </label>
                <select
                  id="asset_type"
                  name="asset_type"
                  value={formData.asset_type}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="stock">Stock</option>
                  <option value="etf">ETF</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="bond">Bond</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700">
                  Purchase Price ($) *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="purchase_price"
                    id="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                {fetchingPrice && (
                  <p className="mt-1 text-sm text-gray-500">Fetching current price...</p>
                )}
                {currentPrice && !fetchingPrice && (
                  <p className="mt-1 text-sm text-green-600">Current price: ${currentPrice.toFixed(2)}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  id="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/portfolios/${portfolioId}`)}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Asset' : 'Add Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;