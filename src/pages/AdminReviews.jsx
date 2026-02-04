import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { reviewsAPI } from '../utils/api';
import { Star, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reviews]);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getAll();
      setReviews(response.data);
      setFilteredReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await reviewsAPI.updateStatus(id, status);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewsAPI.delete(id);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStats = () => {
    return {
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      avgRating: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Review Management</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Reviews</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Avg Rating</h3>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-yellow-600">{stats.avgRating}</p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            
            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reviews found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div 
                  key={review._id} 
                  className={`border-2 rounded-lg p-6 ${getStatusColor(review.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {review.customerName}
                        </h3>
                        {renderStars(review.rating)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Service: <span className="font-semibold">{review.serviceName}</span>
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(review.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-900 italic">"{review.comment}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(review._id, 'approved')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    )}
                    
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusUpdate(review._id, 'rejected')}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    )}
                    
                    {review.status !== 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(review._id, 'pending')}
                        className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition font-semibold"
                      >
                        <Clock className="w-4 h-4" />
                        Mark Pending
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
