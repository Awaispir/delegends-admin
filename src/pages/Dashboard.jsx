import { useState, useEffect } from 'react';
import { bookingsAPI } from '../utils/api';

const Dashboard = () => {
	const [stats, setStats] = useState(null);
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [statsRes, bookingsRes] = await Promise.all([
				bookingsAPI.getStats(),
				bookingsAPI.getAllBookings(),
			]);
			setStats(statsRes.data);
			setBookings(bookingsRes.data);
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

	const getStatusColor = (status) => {
		const colors = {
			pending: 'bg-yellow-100 text-yellow-800',
			confirmed: 'bg-green-100 text-green-800',
			completed: 'bg-blue-100 text-blue-800',
			cancelled: 'bg-red-100 text-red-800',
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-2xl">Loading dashboard...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Sidebar */}
			<div className="flex">
				<div className="w-64 bg-gray-900 text-white min-h-screen p-6">
					<h2 className="text-2xl font-bold mb-8 text-yellow-400">Admin Dashboard</h2>
					<nav className="space-y-4">
						<a href="#overview" className="block py-2 px-4 bg-gray-800 rounded">Overview</a>
						<a href="#bookings" className="block py-2 px-4 hover:bg-gray-800 rounded">Bookings</a>
						<a href="#staff" className="block py-2 px-4 hover:bg-gray-800 rounded">Staff</a>
						<a href="#salons" className="block py-2 px-4 hover:bg-gray-800 rounded">Salons</a>
					</nav>
				</div>

				{/* Main Content */}
				<div className="flex-1 p-8">
					<h1 className="text-4xl font-bold mb-8">Dashboard Overview</h1>

					{/* Stats Cards */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="overview">
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h3 className="text-gray-600 text-sm font-medium mb-2">Total Bookings</h3>
							<p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
						</div>
            
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h3 className="text-gray-600 text-sm font-medium mb-2">Pending</h3>
							<p className="text-3xl font-bold text-yellow-600">{stats?.pendingBookings || 0}</p>
						</div>
            
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h3 className="text-gray-600 text-sm font-medium mb-2">Confirmed</h3>
							<p className="text-3xl font-bold text-green-600">{stats?.confirmedBookings || 0}</p>
						</div>
            
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h3 className="text-gray-600 text-sm font-medium mb-2">Completed</h3>
							<p className="text-3xl font-bold text-blue-600">{stats?.completedBookings || 0}</p>
						</div>

						<div className="bg-white rounded-lg shadow-lg p-6">
							<h3 className="text-gray-600 text-sm font-medium mb-2">Total Staff</h3>
							<p className="text-3xl font-bold text-gray-900">{stats?.totalStaff || 0}</p>
						</div>

						<div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
							<h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
							<p className="text-3xl font-bold text-green-600">€{stats?.totalRevenue || 0}</p>
						</div>
					</div>

					{/* Bookings Management */}
					<div id="bookings" className="bg-white rounded-lg shadow-lg p-6 mb-8">
						<h2 className="text-2xl font-bold mb-6">All Bookings</h2>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="text-left py-3 px-4">Customer</th>
										<th className="text-left py-3 px-4">Salon</th>
										<th className="text-left py-3 px-4">Service</th>
										<th className="text-left py-3 px-4">Date</th>
										<th className="text-left py-3 px-4">Time</th>
										<th className="text-left py-3 px-4">Price</th>
										<th className="text-left py-3 px-4">Status</th>
										<th className="text-left py-3 px-4">Actions</th>
									</tr>
								</thead>
								<tbody>
									{bookings.map((booking) => (
										<tr key={booking.id || booking._id} className="border-b hover:bg-gray-50">
											<td className="py-3 px-4">{booking.customerInfo?.name || booking.user?.name || booking.user?.email || 'Unknown'}</td>
											<td className="py-3 px-4">{booking.location?.name || booking.salon?.name || 'DeLegends'}</td>
											<td className="py-3 px-4">{booking.service}</td>
											<td className="py-3 px-4">{new Date(booking.date).toLocaleDateString()}</td>
											<td className="py-3 px-4">{booking.time}</td>
											<td className="py-3 px-4">€{booking.price}</td>
											<td className="py-3 px-4">
												<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
													{booking.status}
												</span>
											</td>
											<td className="py-3 px-4">
												<select
													value={booking.status}
													onChange={(e) => updateBookingStatus(booking.id || booking._id, e.target.value)}
													className="px-2 py-1 border rounded text-sm"
												>
													<option value="pending">Pending</option>
													<option value="confirmed">Confirmed</option>
													<option value="completed">Completed</option>
													<option value="cancelled">Cancelled</option>
												</select>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{bookings.length === 0 && (
								<p className="text-center py-8 text-gray-600">No bookings yet</p>
							)}
						</div>
					</div>

					{/* Staff Section */}
					<div id="staff" className="bg-white rounded-lg shadow-lg p-6 mb-8">
						<h2 className="text-2xl font-bold mb-6">Staff Members</h2>
						<div className="grid md:grid-cols-3 gap-6">
							{['John Barber', 'Mike Stylist', 'Sarah Specialist', 'Tom Expert', 'Lisa Master', 'Chris Pro'].map((name, idx) => (
								<div key={idx} className="border rounded-lg p-4 text-center">
									<div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
									<h3 className="font-semibold">{name}</h3>
									<p className="text-sm text-gray-600">Senior Barber</p>
								</div>
							))}
						</div>
					</div>

					{/* Quick Stats */}
					<div id="salons" className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-2xl font-bold mb-6">Salon Locations</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center p-4 border rounded">
								<div>
									<h3 className="font-semibold">DeLegends Downtown</h3>
									<p className="text-sm text-gray-600">123 Main Street, New York</p>
								</div>
								<span className="text-green-600 font-semibold">Active</span>
							</div>
							<div className="flex justify-between items-center p-4 border rounded">
								<div>
									<h3 className="font-semibold">DeLegends Uptown</h3>
									<p className="text-sm text-gray-600">456 Park Avenue, New York</p>
								</div>
								<span className="text-green-600 font-semibold">Active</span>
							</div>
							<div className="flex justify-between items-center p-4 border rounded">
								<div>
									<h3 className="font-semibold">DeLegends Brooklyn</h3>
									<p className="text-sm text-gray-600">789 Brooklyn Ave, Brooklyn</p>
								</div>
								<span className="text-green-600 font-semibold">Active</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;

