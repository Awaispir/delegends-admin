import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { bookingsAPI } from '../utils/api';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        bookingsAPI.getStats(),
        bookingsAPI.getAllBookings(),
      ]);
      
      // Sort bookings by creation date (newest first)
      const sortedBookings = bookingsRes.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setStats(statsRes.data);
      setBookings(sortedBookings);
      setFilteredBookings(sortedBookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const handleLocationFilter = (filter) => {
    setLocationFilter(filter);
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(b => b.location?.id === filter);
      setFilteredBookings(filtered);
    }
  };

  const getUniqueLocations = () => {
    const locations = bookings
      .filter(b => b.location)
      .map(b => ({ id: b.location.id, name: b.location.name }))
      .filter((loc, index, self) => 
        index === self.findIndex(l => l.id === loc.id)
      );
    return locations;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isNewBooking = (createdAt) => {
    const bookingDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now - bookingDate) / (1000 * 60 * 60);
    return hoursDiff < 24; // New if created in last 24 hours
  };

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
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingBookings || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.confirmedBookings || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Completed</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.completedBookings || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Staff</h3>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalStaff || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${stats?.totalRevenue || 0}</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Bookings</h2>
            
            {/* Location Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter by Location:</label>
              <select
                value={locationFilter}
                onChange={(e) => handleLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {getUniqueLocations().map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Barber</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.slice(0, 10).map((booking) => (
                  <tr key={booking._id} className={`border-b hover:bg-gray-50 ${isNewBooking(booking.createdAt) ? 'bg-blue-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Show guest customer info or user info */}
                        {booking.customerInfo 
                          ? booking.customerInfo.name 
                          : (booking.user?.name || booking.user?.email || 'Unknown')
                        }
                        {isNewBooking(booking.createdAt) && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                        {/* Guest booking indicator */}
                        {booking.customerInfo && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                            GUEST
                          </span>
                        )}
                      </div>
                      {/* Show email/phone for guest customers */}
                      {booking.customerInfo && (
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.customerInfo.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-yellow-700">
                        {booking.location?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {/* Show multiple services or single service */}
                      {booking.services && booking.services.length > 0 ? (
                        <div>
                          {booking.services.map((svc, idx) => (
                            <div key={idx} className="text-sm">
                              {svc.serviceName}
                            </div>
                          ))}
                          {booking.services.length > 1 && (
                            <span className="text-xs text-gray-500">({booking.services.length} services)</span>
                          )}
                        </div>
                      ) : (
                        booking.serviceName || booking.service?.name || 'N/A'
                      )}
                    </td>
                    <td className="py-3 px-4">{booking.barber?.name || 'Not assigned'}</td>
                    <td className="py-3 px-4">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{booking.time}</td>
                    <td className="py-3 px-4">
                      ${booking.totalPrice || booking.price}
                      {booking.totalDuration && (
                        <div className="text-xs text-gray-500">{booking.totalDuration} min</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;

// import { useState, useEffect } from 'react';
// import AdminLayout from '../layouts/AdminLayout';
// import { bookingsAPI } from '../utils/api';

// const AdminOverview = () => {
//   const [stats, setStats] = useState(null);
//   const [bookings, setBookings] = useState([]);
//   const [filteredBookings, setFilteredBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [locationFilter, setLocationFilter] = useState('all');

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [statsRes, bookingsRes] = await Promise.all([
//         bookingsAPI.getStats(),
//         bookingsAPI.getAllBookings(),
//       ]);
//       setStats(statsRes.data);
//       setBookings(bookingsRes.data);
//       setFilteredBookings(bookingsRes.data);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateBookingStatus = async (id, status) => {
//     try {
//       await bookingsAPI.updateStatus(id, status);
//       fetchData();
//     } catch (error) {
//       console.error('Error updating booking:', error);
//       alert('Failed to update booking status');
//     }
//   };

//   const handleLocationFilter = (filter) => {
//     setLocationFilter(filter);
//     if (filter === 'all') {
//       setFilteredBookings(bookings);
//     } else {
//       setFilteredBookings(bookings.filter(b => b.location?.id === filter));
//     }
//   };

//   const getUniqueLocations = () => {
//     const locations = bookings
//       .filter(b => b.location)
//       .map(b => ({ id: b.location.id, name: b.location.name }))
//       .filter((loc, index, self) => 
//         index === self.findIndex(l => l.id === loc.id)
//       );
//     return locations;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-yellow-100 text-yellow-800',
//       confirmed: 'bg-green-100 text-green-800',
//       completed: 'bg-blue-100 text-blue-800',
//       cancelled: 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="flex items-center justify-center h-full">
//           <div className="text-2xl">Loading...</div>
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="p-8">
//         <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

//         {/* Stats Cards */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-gray-600 text-sm font-medium mb-2">Total Bookings</h3>
//             <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
//             <p className="text-3xl font-bold text-yellow-600">{stats?.pendingBookings || 0}</p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-gray-600 text-sm font-medium mb-2">Confirmed</h3>
//             <p className="text-3xl font-bold text-green-600">{stats?.confirmedBookings || 0}</p>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-gray-600 text-sm font-medium mb-2">Completed</h3>
//             <p className="text-3xl font-bold text-blue-600">{stats?.completedBookings || 0}</p>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-gray-600 text-sm font-medium mb-2">Total Staff</h3>
//             <p className="text-3xl font-bold text-gray-900">{stats?.totalStaff || 0}</p>
//           </div>

//           <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
//             <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
//             <p className="text-3xl font-bold text-green-600">${stats?.totalRevenue || 0}</p>
//           </div>
//         </div>

//         {/* Recent Bookings */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold">Recent Bookings</h2>
            
//             {/* Location Filter */}
//             <div className="flex items-center gap-3">
//               <label className="text-sm font-medium text-gray-700">Filter by Location:</label>
//               <select
//                 value={locationFilter}
//                 onChange={(e) => handleLocationFilter(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
//               >
//                 <option value="all">All Locations</option>
//                 {getUniqueLocations().map(loc => (
//                   <option key={loc.id} value={loc.id}>{loc.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left py-3 px-4">Customer</th>
//                   <th className="text-left py-3 px-4">Location</th>
//                   <th className="text-left py-3 px-4">Service</th>
//                   <th className="text-left py-3 px-4">Barber</th>
//                   <th className="text-left py-3 px-4">Date</th>
//                   <th className="text-left py-3 px-4">Time</th>
//                   <th className="text-left py-3 px-4">Price</th>
//                   <th className="text-left py-3 px-4">Status</th>
//                   <th className="text-left py-3 px-4">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredBookings.slice(0, 10).map((booking) => (
//                   <tr key={booking._id} className="border-b hover:bg-gray-50">
//                     <td className="py-3 px-4">{booking.user?.name || booking.user?.email || 'Unknown'}</td>
//                     <td className="py-3 px-4">
//                       <span className="text-sm font-medium text-yellow-700">
//                         {booking.location?.name || 'N/A'}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">{booking.serviceName || booking.service?.name || 'N/A'}</td>
//                     <td className="py-3 px-4">{booking.barber?.name || 'Not assigned'}</td>
//                     <td className="py-3 px-4">{new Date(booking.date).toLocaleDateString()}</td>
//                     <td className="py-3 px-4">{booking.time}</td>
//                     <td className="py-3 px-4">${booking.price}</td>
//                     <td className="py-3 px-4">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
//                         {booking.status}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">
//                       <select
//                         value={booking.status}
//                         onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
//                         className="px-2 py-1 border rounded text-sm"
//                       >
//                         <option value="pending">Pending</option>
//                         <option value="confirmed">Confirmed</option>
//                         <option value="completed">Completed</option>
//                         <option value="cancelled">Cancelled</option>
//                       </select>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default AdminOverview;
