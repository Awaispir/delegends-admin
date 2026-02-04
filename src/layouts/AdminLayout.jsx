import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../utils/api';
import { Bell, Search, Settings, Calendar, BarChart2, Menu, Users, Package, UserCircle2, FileText, X, ShoppingBag, MessageSquare, Briefcase } from 'lucide-react';

const AdminLayout = ({ children }) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [showNotifications, setShowNotifications] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [selectedNotification, setSelectedNotification] = useState(null);
	const [bookingDetails, setBookingDetails] = useState(null);

	// Fetch bookings for notifications
	useEffect(() => {
		fetchNotifications();
		// Refresh notifications more frequently - every 10 seconds
		const interval = setInterval(fetchNotifications, 10000);
		return () => clearInterval(interval);
	}, []);

	const fetchNotifications = async () => {
		try {
			// Use getAllWithGuests to include guest bookings
			const response = await bookingsAPI.getAllWithGuests();
			const bookings = response.data;
      
			// Convert bookings to notifications with better categorization
			const notifs = bookings.map(booking => {
				const date = new Date(booking.date);
				const time = booking.time;
				const customerName = booking.customerInfo?.name || booking.user?.name || booking.user?.email || booking.guestCustomer?.name || 'Unknown Customer';
				const serviceName = booking.serviceName || booking.service?.name || 'Service';
				const barberName = booking.barber?.name || 'Not assigned';
				
				// Determine notification type
				let notifType = 'new_booking';
				let title = 'New Booking';
				
				const createdTime = new Date(booking.createdAt);
				const updatedTime = new Date(booking.updatedAt || booking.createdAt);
				const timeDiff = updatedTime - createdTime;
				
				// If updated significantly after creation, it's a status change
				if (timeDiff > 5000) { // More than 5 seconds difference
					notifType = 'status_change';
					if (booking.status === 'confirmed') {
						title = 'Booking Confirmed';
					} else if (booking.status === 'completed') {
						title = 'Booking Completed';
					} else if (booking.status === 'cancelled') {
						title = 'Booking Cancelled';
					} else {
						title = 'Status Updated';
					}
				}
				
				// Check if it's a recent notification based on CREATION time
				const now = new Date();
				const hoursSinceCreation = (now - createdTime) / (1000 * 60 * 60);
				const hoursSinceUpdate = (now - updatedTime) / (1000 * 60 * 60);
				
				// Show as new if: created in last 24 hours OR status updated in last 6 hours
				const isNew = hoursSinceCreation < 24 || hoursSinceUpdate < 6;
					  
				return {
					id: booking._id,
					type: notifType,
					title: title,
					message: `${customerName} - ${serviceName} with ${barberName}`,
					time: `${date.toLocaleDateString()} at ${time}`,
					status: booking.status,
					createdAt: booking.createdAt,
					updatedAt: booking.updatedAt || booking.createdAt,
					isNew: isNew,
					booking: booking
				};
			});
					  
			// Sort by priority: New bookings first (by creation), then by update time
			notifs.sort((a, b) => {
				// If both are new, sort by creation time (newest first)
				if (a.isNew && b.isNew) {
					const dateA = new Date(a.createdAt);
					const dateB = new Date(b.createdAt);
					return dateB - dateA;
				}
				// New notifications come first
				if (a.isNew && !b.isNew) return -1;
				if (!a.isNew && b.isNew) return 1;
				// Otherwise sort by updated date
				const dateA = new Date(a.updatedAt);
				const dateB = new Date(b.updatedAt);
				return dateB - dateA;
			});
			
			// Count unread (new notifications in last 24 hours)
			const unread = notifs.filter(n => n.isNew).length;
			setUnreadCount(unread);
			
			setNotifications(notifs);
		} catch (error) {
			console.error('Error fetching notifications:', error);
		}
	};

	const handleNotificationClick = (notif) => {
		console.log('🔔 Notification clicked:', notif.title);
		console.log('👤 Customer:', notif.booking.customerInfo?.name || notif.booking.user?.name);
		console.log('📅 Booking date:', notif.booking.date);
		console.log('⏰ Booking time:', notif.booking.time);
		console.log('🆕 Is New:', notif.isNew);
		console.log('📝 Created:', notif.createdAt);
		setShowNotifications(false);
		// Navigate to calendar with booking data
		navigate('/admin/calendar', { 
			state: { 
				selectedBooking: notif.booking,
				scrollToBooking: true 
			},
			replace: false // Don't replace history, add new entry
		});
	};

	const getNotificationColor = (status) => {
		const colors = {
			pending: 'bg-yellow-50 border-l-4 border-yellow-400',
			confirmed: 'bg-green-50 border-l-4 border-green-400',
			completed: 'bg-blue-50 border-l-4 border-blue-400',
			cancelled: 'bg-red-50 border-l-4 border-red-400',
		};
		return colors[status] || 'bg-gray-50';
	};

	const navItems = [
		{ name: 'Calendar', path: '/admin/calendar', icon: Calendar },
		{ name: 'Overview', path: '/admin/overview', icon: BarChart2 },
		{ name: 'Menu', path: '/admin/menu', icon: FileText },
		{ name: 'Team', path: '/admin/team', icon: Users },
		{ name: 'Products', path: '/admin/products', icon: Package },
		{ name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
		{ name: 'Customers', path: '/admin/customers', icon: UserCircle2 },
		{ name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
		{ name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
		{ name: 'Marketing', path: '/admin/marketing', icon: Menu },
		{ name: 'Reports', path: '/admin/reports', icon: BarChart2 },
	];

	const handleLogout = () => {
		logout();
		navigate('/auth/login');
	};

	return (
		<div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
			{/* Top Navigation Bar - Fixed */}
			<nav className="bg-[#1e293b] text-white shadow-lg flex-shrink-0">
				<div className="flex items-center justify-between px-6 py-2">
					{/* Logo */}
					<div className="flex items-center">
						<img 
							src="/logo.png" 
							alt="DE Legends" 
							className="h-14 w-auto object-contain"
						/>
					</div>

					{/* Navigation Tabs */}
					<div className="flex items-center space-x-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = location.pathname === item.path;
							return (
								<button
									key={item.path}
									onClick={() => navigate(item.path)}
									className={`px-4 py-2 rounded-t-lg transition-colors ${
										isActive 
											? 'bg-[#334155] text-white' 
											: 'text-gray-300 hover:bg-[#2d3748] hover:text-white'
									}`}
								>
									{item.name}
								</button>
							);
						})}
					</div>

					{/* Right Side Icons */}
					<div className="flex items-center space-x-4">
						<button className="p-2 hover:bg-[#2d3748] rounded-full">
							<Search className="w-5 h-5" />
						</button>
            
						{/* Notifications */}
						<div className="relative">
							<button 
								onClick={() => {
									setShowNotifications(!showNotifications);
									// Refresh notifications when opening
									if (!showNotifications) {
										fetchNotifications();
									}
								}}
								className="p-2 hover:bg-[#2d3748] rounded-full relative"
							>
								<Bell className="w-5 h-5" />
								{unreadCount > 0 && (
									<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
										{unreadCount > 9 ? '9+' : unreadCount}
									</span>
								)}
							</button>

							{showNotifications && (
								<div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 text-gray-800 max-h-[600px] flex flex-col">
									<div className="p-4 border-b flex items-center justify-between">
										<h3 className="font-semibold text-lg">Notifications</h3>
										<div className="flex items-center gap-2">
											{unreadCount > 0 && (
												<span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
													{unreadCount} New
												</span>
											)}
											<span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
												{notifications.length} Total
											</span>
										</div>
									</div>
									<div className="flex-1 overflow-y-auto">
										{notifications.length === 0 ? (
											<p className="p-4 text-gray-500 text-center">No notifications yet</p>
										) : (
											notifications.map((notif) => {
												// Calculate time ago
												const updatedDate = new Date(notif.updatedAt);
												const now = new Date();
												const diffMs = now - updatedDate;
												const diffMins = Math.floor(diffMs / 60000);
												const diffHours = Math.floor(diffMs / 3600000);
												const diffDays = Math.floor(diffMs / 86400000);
												
												let timeAgo;
												if (diffMins < 1) timeAgo = 'Just now';
												else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
												else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
												else timeAgo = `${diffDays}d ago`;
												
												return (
													<div 
														key={notif.id} 
														className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${getNotificationColor(notif.status)} ${notif.isNew ? 'bg-blue-50/50' : ''}`}
														onClick={() => handleNotificationClick(notif)}
													>
														<div className="flex items-start gap-3">
															{/* Content */}
															<div className="flex-1 min-w-0">
																<div className="flex items-start justify-between gap-2 mb-1">
																	<p className="text-sm font-bold text-gray-900">{notif.title}</p>
																	<span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
																</div>
																<p className="text-xs text-gray-700 mb-1 line-clamp-2">{notif.message}</p>
																<div className="flex items-center gap-2 mt-2">
																	<p className="text-xs text-gray-500">{notif.time}</p>
																	<span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
																		notif.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
																		notif.status === 'confirmed' ? 'bg-green-200 text-green-800' :
																		notif.status === 'completed' ? 'bg-blue-200 text-blue-800' :
																		'bg-red-200 text-red-800'
																	}`}>
																		{notif.status}
																	</span>
																	{notif.isNew && (
																		<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
																			NEW
																		</span>
																	)}
																</div>
															</div>
														</div>
													</div>
												);
											})
										)}
									</div>
								</div>
							)}
						</div>

						<button className="p-2 hover:bg-[#2d3748] rounded-full">
							<Settings className="w-5 h-5" />
						</button>

						{/* User Menu */}
						<div className="relative">
							<button 
								onClick={() => setShowUserMenu(!showUserMenu)}
								className="flex items-center space-x-2 p-2 hover:bg-[#2d3748] rounded-full"
							>
								<div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
									{user?.name?.charAt(0).toUpperCase() || 'A'}
								</div>
							</button>

							{showUserMenu && (
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 text-gray-800">
									<div className="p-4 border-b">
										<p className="font-semibold">{user?.name}</p>
										<p className="text-xs text-gray-600">{user?.email}</p>
									</div>
									<button
										onClick={handleLogout}
										className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
									>
										Logout
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content - Scrollable */}
			<main className="flex-1 overflow-auto">
				{children}
			</main>

			{/* Booking Details Modal */}
			{bookingDetails && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setBookingDetails(null)}>
					<div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
							<button 
								onClick={() => setBookingDetails(null)}
								className="p-2 hover:bg-gray-100 rounded-full transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-4">
							<div className="p-4 bg-gray-50 rounded-lg">
								<p className="text-xs text-gray-600 mb-1">Customer</p>
								<p className="text-lg font-semibold text-gray-900">
									{bookingDetails.user?.name || bookingDetails.user?.email || 'Unknown'}
								</p>
								{bookingDetails.user?.email && bookingDetails.user?.name && (
									<p className="text-sm text-gray-600">{bookingDetails.user.email}</p>
								)}
								{bookingDetails.user?.phone && (
									<p className="text-sm text-gray-600">📞 {bookingDetails.user.phone}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 bg-blue-50 rounded-lg">
									<p className="text-xs text-blue-600 mb-1">Location</p>
									<p className="font-semibold text-gray-900">
										{bookingDetails.location?.name || 'N/A'}
									</p>
								</div>

								<div className="p-3 bg-purple-50 rounded-lg">
									<p className="text-xs text-purple-600 mb-1">Service</p>
									<p className="font-semibold text-gray-900">
										{bookingDetails.serviceName || bookingDetails.service?.name || 'N/A'}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 bg-indigo-50 rounded-lg">
									<p className="text-xs text-indigo-600 mb-1">Barber</p>
									<p className="font-semibold text-gray-900">
										{bookingDetails.barber?.name || 'Not assigned'}
									</p>
								</div>

								<div className="p-3 bg-pink-50 rounded-lg">
									<p className="text-xs text-pink-600 mb-1">Price</p>
									<p className="text-xl font-bold text-gray-900">${bookingDetails.price}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 bg-green-50 rounded-lg">
									<p className="text-xs text-green-600 mb-1">Date</p>
									<p className="font-semibold text-gray-900">
										{new Date(bookingDetails.date).toLocaleDateString('en-US', {
											weekday: 'short',
											year: 'numeric',
											month: 'short',
											day: 'numeric'
										})}
									</p>
								</div>

								<div className="p-3 bg-yellow-50 rounded-lg">
									<p className="text-xs text-yellow-600 mb-1">Time</p>
									<p className="font-semibold text-gray-900">{bookingDetails.time}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="p-3 bg-teal-50 rounded-lg">
									<p className="text-xs text-teal-600 mb-1">Status</p>
									<span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${
										bookingDetails.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
										bookingDetails.status === 'confirmed' ? 'bg-green-200 text-green-800' :
										bookingDetails.status === 'completed' ? 'bg-blue-200 text-blue-800' :
										'bg-red-200 text-red-800'
									}`}>
										{bookingDetails.status}
									</span>
								</div>
							</div>

							{bookingDetails.notes && (
								<div className="p-3 bg-gray-50 rounded-lg">
									<p className="text-xs text-gray-600 mb-1">Notes</p>
									<p className="text-sm text-gray-900">{bookingDetails.notes}</p>
								</div>
							)}

							<div className="p-3 bg-gray-50 rounded-lg">
								<p className="text-xs text-gray-600 mb-1">Booked On</p>
								<p className="text-sm text-gray-900">
									{new Date(bookingDetails.createdAt).toLocaleString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									onClick={() => {
										setBookingDetails(null);
										navigate('/admin/calendar');
									}}
									className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold"
								>
									View in Calendar
								</button>
								<button
									onClick={() => setBookingDetails(null)}
									className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-semibold"
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminLayout;

