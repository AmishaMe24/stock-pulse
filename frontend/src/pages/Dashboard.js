import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolios } from '../services/api';

const Dashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const data = await getPortfolios();
        setPortfolios(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching portfolios', error);
        setError('Failed to load portfolios. Please try again later.');
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner"></div>
        <p className="mt-2 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Dashboard</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Welcome to Stock Pulse! Monitor your portfolios and alerts.
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Portfolio Summary Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Portfolios
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {portfolios.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                to="/portfolios"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all portfolios
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Add Portfolio Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Create a new portfolio
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Start tracking your investments by creating a new portfolio.</p>
            </div>
            <div className="mt-5">
              <Link
                to="/portfolios/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Portfolio
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Alerts Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Alerts
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Stay updated with your latest stock alerts.</p>
            </div>
            <div className="mt-5">
              <Link
                to="/alerts"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Alerts
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Portfolios Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Your Portfolios</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          {portfolios.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">You don't have any portfolios yet.</p>
              <Link
                to="/portfolios/new"
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create your first portfolio
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {portfolios.slice(0, 5).map((portfolio) => (
                <li key={portfolio.id}>
                  <Link
                    to={`/portfolios/${portfolio.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {portfolio.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {portfolio.assets?.length || 0} assets
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Created on {new Date(portfolio.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {portfolios.length > 5 && (
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Link
                to="/portfolios"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all portfolios
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Market Overview Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Market Overview</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md p-6">
          <p className="text-gray-500">
            Market data will be displayed here. Connect to the stock API to see real-time market data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;