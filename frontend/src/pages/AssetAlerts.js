import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAlertsByAsset, createAlert, updateAlert, deleteAlert } from '../services/api';

const AssetAlerts = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    alert_type: 'price_above',
    threshold_value: '',
    notification_method: 'email',
    is_active: true
  });
  const [editingAlertId, setEditingAlertId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [assetId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlertsByAsset(assetId);
      setAlerts(data);
      setError('');
    } catch (error) {
      console.error('Error fetching alerts', error);
      setError('Failed to load alerts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.threshold_value) {
      setError('Please enter a threshold value');
      return;
    }

    try {
      const alertData = {
        ...formData,
        asset_id: parseInt(assetId),
        threshold_value: parseFloat(formData.threshold_value)
      };

      if (editingAlertId) {
        await updateAlert(editingAlertId, alertData);
      } else {
        await createAlert(alertData);
      }
      
      // Reset form and fetch updated alerts
      setFormData({
        alert_type: 'price_above',
        threshold_value: '',
        notification_method: 'email',
        is_active: true
      });
      setShowForm(false);
      setEditingAlertId(null);
      fetchAlerts();
    } catch (error) {
      console.error('Error saving alert', error);
      setError('Failed to save alert. Please try again later.');
    }
  };

  const handleEdit = (alert) => {
    setFormData({
      alert_type: alert.alert_type,
      threshold_value: alert.threshold_value.toString(),
      notification_method: alert.notification_method,
      is_active: alert.is_active
    });
    setEditingAlertId(alert.id);
    setShowForm(true);
  };

  const handleDelete = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await deleteAlert(alertId);
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting alert', error);
        setError('Failed to delete alert. Please try again later.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner"></div>
        <p className="mt-2 text-gray-600">Loading alerts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-lg leading-6 font-medium text-gray-900">Asset Alerts</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage price alerts for this asset
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAlertId(null);
              setFormData({
                alert_type: 'price_above',
                threshold_value: '',
                notification_method: 'email',
                is_active: true
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showForm ? 'Cancel' : 'Add Alert'}
          </button>
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

      {/* Alert Form */}
      {showForm && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingAlertId ? 'Edit Alert' : 'Create New Alert'}
            </h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="alert_type" className="block text-sm font-medium text-gray-700">
                    Alert Type
                  </label>
                  <select
                    id="alert_type"
                    name="alert_type"
                    value={formData.alert_type}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="price_change_percent">Price Change %</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="threshold_value" className="block text-sm font-medium text-gray-700">
                    Threshold Value
                  </label>
                  <input
                    type="number"
                    name="threshold_value"
                    id="threshold_value"
                    value={formData.threshold_value}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    step="0.01"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.alert_type === 'price_change_percent' 
                      ? 'Enter percentage value (e.g., 5 for 5%)' 
                      : 'Enter price value in dollars'}
                  </p>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="notification_method" className="block text-sm font-medium text-gray-700">
                    Notification Method
                  </label>
                  <select
                    id="notification_method"
                    name="notification_method"
                    value={formData.notification_method}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="both">Both Email & SMS</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-start mt-5">
                    <div className="flex items-center h-5">
                      <input
                        id="is_active"
                        name="is_active"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="is_active" className="font-medium text-gray-700">
                        Active
                      </label>
                      <p className="text-gray-500">Enable or disable this alert</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAlertId(null);
                  }}
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingAlertId ? 'Update Alert' : 'Create Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-gray-500">No alerts set up for this asset yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create your first alert
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.alert_type === 'price_above' && 'Price Above'}
                      {alert.alert_type === 'price_below' && 'Price Below'}
                      {alert.alert_type === 'price_change_percent' && 'Price Change %'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.alert_type === 'price_change_percent' 
                        ? `${alert.threshold_value}%` 
                        : `$${alert.threshold_value.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.notification_method === 'email' && 'Email'}
                      {alert.notification_method === 'sms' && 'SMS'}
                      {alert.notification_method === 'both' && 'Email & SMS'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(alert)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAlerts;