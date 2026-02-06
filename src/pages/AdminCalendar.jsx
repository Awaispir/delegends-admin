import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MapPin, Clock, Scissors, User, DollarSign, Building2, Timer, MoreVertical, X, Lightbulb, BookOpen, Sparkles, MessageCircle, ChevronDown, Phone, Mail, Edit, Repeat, UserCircle, Check, CreditCard } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { bookingsAPI, barbersAPI, customersAPI, authAPI, servicesAPI } from '../utils/api';
import api from '../utils/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminCalendar = () => {
	const location = useLocation();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [bookings, setBookings] = useState([]);
	const [filteredBookings, setFilteredBookings] = useState([]);
	const [barbers, setBarbers] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
	const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
	const [showCreateAppointmentModal, setShowCreateAppointmentModal] = useState(false);
	const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [showRepeatModal, setShowRepeatModal] = useState(false);
	const [repeatBookingData, setRepeatBookingData] = useState({
		date: '',
		time: '',
		barber: '',
		service: '',
		notes: ''
	});
	const [commentText, setCommentText] = useState('');
	const [customerDetails, setCustomerDetails] = useState(null);
	const [editCustomerData, setEditCustomerData] = useState({
		name: '',
		phone: '',
		email: '',
		marketingConsent: false,
		prepaymentRequired: false,
		gender: 'Other / Prefers not to disclose',
		birthMonth: '',
		birthDay: '',
		birthYear: '',
		note: ''
	});
	const [editAppointmentData, setEditAppointmentData] = useState({
		date: '',
		time: '',
		barber: '',
		service: '',
		notes: ''
	});
	const [newAppointmentData, setNewAppointmentData] = useState({
		date: new Date().toISOString().split('T')[0],
		time: '',
		barber: '',
		service: '',
		customerName: '',
		customerEmail: '',
		customerPhone: '',
		notes: ''
	});
	const [hoveredBooking, setHoveredBooking] = useState(null);
	const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
	const [locations, setLocations] = useState([]);
	const [selectedLocation, setSelectedLocation] = useState('all');
	const [services, setServices] = useState([]);

	useEffect(() => {
		fetchBookings();
		fetchBarbers();
		fetchServices();
		// Poll for new bookings every 30 seconds
		const interval = setInterval(fetchBookings, 30000);
		return () => clearInterval(interval);
	}, []);

	// Handle notification click - scroll to booking and show modal
	useEffect(() => {
		if (location.state?.selectedBooking && location.state?.scrollToBooking) {
			const booking = location.state.selectedBooking;
			
			// Immediately set the date
			const bookingDate = new Date(booking.date);
			setSelectedDate(bookingDate);
			setCurrentDate(bookingDate);
			
			// Wait for bookings to load first
			const checkAndScroll = () => {
				if (bookings.length > 0) {
					// Find the booking in current bookings list
					const currentBooking = bookings.find(b => b._id === booking._id) || booking;
					
					// Show the booking details modal
					setSelectedBooking(currentBooking);
					setShowDetailModal(true);
					
					// Scroll to the booking's time slot after a short delay
					setTimeout(() => {
						const timeSlot = parseTime(currentBooking.time);
						if (timeSlot) {
							const timeElement = document.getElementById(`time-slot-${timeSlot}`);
							if (timeElement) {
								timeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
							}
						}
					}, 800);
					
					// Clear the state
					window.history.replaceState({}, document.title);
				} else {
					// Retry after bookings are loaded
					setTimeout(checkAndScroll, 200);
				}
			};
			
			checkAndScroll();
		}
	}, [location.state, bookings]);

	useEffect(() => {
		filterBookingsByLocation();
	}, [bookings, selectedLocation]);

	const fetchBarbers = async () => {
		try {
			const response = await barbersAPI.getAll();
			setBarbers(response.data);
		} catch (error) {
			console.error('Error fetching barbers:', error);
		}
	};

	const fetchServices = async () => {
		try {
			const response = await servicesAPI.getAll();
			setServices(response.data);
		} catch (error) {
			console.error('Error fetching services:', error);
		}
	};

	const fetchCustomerDetails = async (customerId) => {
		try {
			if (!customerId) {
				alert('❌ Customer ID not found');
				return;
			}
			console.log('Fetching customer details for ID:', customerId);
			const response = await customersAPI.getOne(customerId);
			console.log('Customer details response:', response.data);
			setCustomerDetails(response.data);
			setShowCustomerInfoModal(true);
		} catch (error) {
			console.error('Error fetching customer details:', error);
			alert('❌ Failed to load customer details: ' + (error.response?.data?.message || error.message));
		}
	};

	// Fetch customer details by email (for guest bookings)
	const fetchCustomerDetailsByEmail = async (email) => {
		try {
			if (!email) {
				alert('❌ Customer email not found');
				return;
			}
			console.log('Fetching customer details for email:', email);
			const response = await customersAPI.getByEmail(email);
			console.log('Customer details response:', response.data);
			setCustomerDetails(response.data);
			setShowCustomerInfoModal(true);
		} catch (error) {
			console.error('Error fetching customer details by email:', error);
			alert('❌ Failed to load customer details: ' + (error.response?.data?.message || error.message));
		}
	};

	// Handle edit customer from calendar modal
	const handleEditCustomerClick = () => {
		console.log('Edit data clicked');
		console.log('Customer details:', customerDetails);
		// Populate edit form with customer data
		if (customerDetails?.customer) {
			const customer = customerDetails.customer;
			console.log('Setting edit customer data for:', customer.name);
			setEditCustomerData({
				name: customer.name || '',
				phone: customer.phone || '',
				email: customer.email || '',
				marketingConsent: customer.marketingConsent || false,
				prepaymentRequired: customer.prepaymentRequired || false,
				gender: customer.gender || 'Other / Prefers not to disclose',
				birthMonth: customer.birthMonth || '',
				birthDay: customer.birthDay || '',
				birthYear: customer.birthYear || '',
				note: customer.note || ''
			});
			setShowEditCustomerModal(true);
			console.log('Modal should be shown now');
		} else {
			console.error('No customer details found!');
			alert('Customer details not available');
		}
	};

	// Handle save customer from drawer
	const handleSaveCustomer = async (updatedData) => {
		try {
			if (!customerDetails?.customer?._id) {
				alert('Customer ID not found');
				return;
			}
			await customersAPI.update(customerDetails.customer._id, updatedData);
			// Refresh customer details
			await fetchCustomerDetails(customerDetails.customer._id);
			setShowEditDrawer(false);
			alert('Customer updated successfully!');
		} catch (error) {
			console.error('Error updating customer:', error);
			alert('Failed to update customer');
		}
	};

	// Handle save customer from edit modal
	const handleSaveEditCustomer = async () => {
		try {
			if (!customerDetails?.customer?._id) {
				alert('Customer ID not found');
				return;
			}
			const updateData = {
				name: editCustomerData.name,
				phone: editCustomerData.phone,
				email: editCustomerData.email,
				marketingConsent: editCustomerData.marketingConsent,
				prepaymentRequired: editCustomerData.prepaymentRequired,
				gender: editCustomerData.gender,
				birthMonth: editCustomerData.birthMonth,
				birthDay: editCustomerData.birthDay,
				birthYear: editCustomerData.birthYear,
				note: editCustomerData.note
			};
			await customersAPI.update(customerDetails.customer._id, updateData);
			// Refresh customer details
			await fetchCustomerDetails(customerDetails.customer._id);
			setShowEditCustomerModal(false);
			alert('Customer updated successfully!');
		} catch (error) {
			console.error('Error updating customer:', error);
			alert('Failed to update customer');
		}
	};

	// Handle charge payment after service completion
	const handleChargePayment = async (bookingId) => {
		try {
			if (!confirm('Are you sure you want to charge this customer\'s card now?')) {
				return;
			}

			const token = localStorage.getItem('token');
			const response = await axios.post(
				`${API_URL}/admin/bookings/${bookingId}/charge-payment`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (response.data.success) {
				alert(`✅ Payment charged successfully! Amount: €${response.data.amount}`);
				// Refresh bookings
				await fetchBookings();
				setShowDetailModal(false);
				setSelectedBooking(null);
			} else {
				alert(`❌ Payment charge failed: ${response.data.message}`);
			}
		} catch (error) {
			console.error('Error charging payment:', error);
			const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to charge payment';
			alert(`❌ ${errorMsg}`);
		}
	};

	// Handle repeat booking
	const handleRepeatBooking = () => {
		if (!selectedBooking) return;
		
		// Quick options: Next Week, 2 Weeks, 4 Weeks, Custom
		const nextWeek = new Date(selectedBooking.date);
		nextWeek.setDate(nextWeek.getDate() + 7);
		
		setRepeatBookingData({
			date: nextWeek.toISOString().split('T')[0],
			time: selectedBooking.time, // Same time as original
			barber: selectedBooking.barber?._id || '',
			service: selectedBooking.service?._id || '',
			notes: 'Repeat booking'
		});
		
		setShowRepeatModal(true);
	};

	// Quick repeat options
	const handleQuickRepeat = async (weeksAhead) => {
		if (!selectedBooking) return;
		
		try {
			const futureDate = new Date(selectedBooking.date);
			futureDate.setDate(futureDate.getDate() + (weeksAhead * 7));
			
			const token = localStorage.getItem('token');
			
			const bookingPayload = {
				customerName: selectedBooking.customerInfo?.name || selectedBooking.user?.name,
				customerEmail: selectedBooking.customerInfo?.email || selectedBooking.user?.email,
				customerPhone: selectedBooking.customerInfo?.phone || selectedBooking.user?.phone,
				service: selectedBooking.service?._id,
				barber: selectedBooking.barber?._id,
				date: futureDate.toISOString().split('T')[0],
				time: selectedBooking.time,
				notes: `Repeat booking - ${weeksAhead} week(s) after original`,
				location: selectedBooking.location,
				source: 'Manual'
			};

			await axios.post(`${API_URL}/bookings`, bookingPayload, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			alert(`✅ Repeat booking created for ${futureDate.toLocaleDateString()}!`);
			setShowRepeatModal(false);
			setShowDetailModal(false);
			setSelectedBooking(null);
			await fetchBookings();
		} catch (error) {
			console.error('Error creating repeat booking:', error);
			alert('❌ Failed to create repeat booking: ' + (error.response?.data?.message || error.message));
		}
	};

	// Submit repeat booking
	const handleSubmitRepeatBooking = async () => {
		try {
			if (!repeatBookingData.date || !repeatBookingData.time || !repeatBookingData.service) {
				alert('Please fill in date, time, and service');
				return;
			}

			const token = localStorage.getItem('token');
			
			// Create new booking with same customer info
			const bookingPayload = {
				customerName: selectedBooking.customerInfo?.name || selectedBooking.user?.name,
				customerEmail: selectedBooking.customerInfo?.email || selectedBooking.user?.email,
				customerPhone: selectedBooking.customerInfo?.phone || selectedBooking.user?.phone,
				service: repeatBookingData.service,
				barber: repeatBookingData.barber,
				date: repeatBookingData.date,
				time: repeatBookingData.time,
				notes: repeatBookingData.notes,
				location: selectedBooking.location,
				source: 'Manual'
			};

			await axios.post(`${API_URL}/bookings`, bookingPayload, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			alert('✅ Repeat booking created successfully!');
			setShowRepeatModal(false);
			setShowDetailModal(false);
			setSelectedBooking(null);
			await fetchBookings();
		} catch (error) {
			console.error('Error creating repeat booking:', error);
			alert('❌ Failed to create repeat booking: ' + (error.response?.data?.message || error.message));
		}
	};

	const fetchBookings = async () => {
		try {
			// Use getAllWithGuests to include guest bookings
			const response = await bookingsAPI.getAllWithGuests();
			const newBookings = response.data;
      
			// Check for new bookings AND status changes
			if (bookings.length > 0) {
				// 1. Check for NEW bookings (by ID)
				const existingIds = new Set(bookings.map(b => b._id));
				const newAppointments = newBookings.filter(b => !existingIds.has(b._id));
				
				if (newAppointments.length > 0) {
					newAppointments.forEach(newBooking => {
						const customerName = newBooking.customerInfo?.name || newBooking.user?.name || 'Customer';
						const serviceName = newBooking.serviceName || newBooking.service?.name || 'service';
						const barberName = newBooking.barber?.name || 'barber';
						
						const notification = {
							id: `new-${newBooking._id}`,
							type: 'new',
							title: '📥 New Appointment!',
							message: `${customerName} booked ${serviceName} with ${barberName}`,
							time: new Date().toLocaleTimeString(),
							booking: newBooking,
						};
						setNotifications(prev => [notification, ...prev].slice(0, 20));
					});
					
					// Play notification sound
					if (typeof Audio !== 'undefined') {
						try {
							const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSpuxuW9gl0UElGh4/CzbSIFHW/L59BHJAoUU6Lh6ZZLDAgjc8rx0H0iCBBPo+TsmkwOCB1qyfDQczALDEOR4eeUUxEKHGS16+yBRAwHImS56+p5TAcLG1q47O17TQ0NHmjA7N56Tw0OG1K97fB9SgwQFEun6/B3UQ8RElCl5/KAUxENElGi4e2dTQsNE0+k5fF8UAwMEkat5/SHVxQUE1at5eqLWxgWFE6j4+uZWhocGFGm5fd6XyEdGlWr5/SGZCklH0us6PV8ZSkpIFCp4+x8aS4uHk6o5Op3bjMxH0qn4el2aTcyIFKo5+x0ZTI0JU6p5u11bTA1KUuu5+lxZjQ4KEus5+huaTc5L0+p4+duZjY6OE2n5uh0bjY7N0qo5+x3djc8NkWk5e17eTg/PUun4+x8ejpBQUqn5e+AejtDR0ik4+6GeT1FS0Kl4++HeTxISzuk5PCLdz5NTD+g4vCReD9PT06h4/CNeUBOTTqi5fKPezpNTkid5/SMeTtPUT6c5/SRezdOUUKd5/OPeDdPS0Ga5/SPeTlQSkSc5e+MdztSS0Oa5vCMeD1SS0Kb5u+Jdz5TSkOb5u+JeEBTSUKb5e+FeEJUSD+a5fCIdkNWRz2Y5/SLdURXRjyY5/KHdUVZRjuV5/KJdkVaRjqU5e+Gd0dcRjiS5u+Gd0leSzSP5/KIeUtgSy+N6PSKektjSyyJ6faMfE9mSiuG6faQf1FoSSuD6faSgFNrSCl/6fiUglZsSCd96PmYhVltSCZ76PqaiVpwSCR46fqdiljxRyN26vugjlxzRyF06v2klWB2Rh9x7P2qmGJ4Rh1u7f+vnmR6RRtr7/+yn2J8RRlp8f+0oWR9RBdn8v+1omaBQxRl9P+4pGeAQhNh9P+5qGiBQhBe9f+7rG2CQQxb9v+9rnCDQQpY+P/AsnOEPwhV+f/CtXaEPgZR+//FunmEPQNO/P/HvnyFPQFM/v/KxH+FPgBJ///NyYKGPvxG///QzYSIPflD///T0IeIQfY//v/W1IuJRPQ8/f/Z2I6KR/E5/P/d3ZGLSe03+//h4JSNTOo0+v/m55+PTucy+f/r7aWQUPMw9//w87OQUfAt9v/2+L+RU+4o9P/8/byQVOoj8v8A/LiQV+ce7/8B/bGPWOQa7f8C/auOWuEW6/8D+6SMW94S6P8E96SLXdsO5f8F9J2JXtgL4/8F8JeHYNUJ4f8E7pGFYNMH3/8C65CDYNEH3/8B55+CYdAG3/8A5JyBYs8G4P/9456AY88H4f/6353/Y88I4v/232//ZM8J5P/t3m7/Zc8L5v/q3G3+Zc8N6P/o22z9Zc8O7P/m2Wz7Zs8P8P/i12v6Z88Q9P/f1Wr4Z88R9//c0mr3Zs8S/P/Y0Gn2Z88T///U0Gr1Z88U//8=');
							audio.play().catch(() => {});
						} catch (e) {}
					}
				}
				
				// 2. Check for STATUS changes
				const statusChanges = [];
				bookings.forEach(oldBooking => {
					const updatedBooking = newBookings.find(b => b._id === oldBooking._id);
					if (updatedBooking && oldBooking.status !== updatedBooking.status) {
						statusChanges.push({
							booking: updatedBooking,
							oldStatus: oldBooking.status,
							newStatus: updatedBooking.status
						});
					}
				});
				
				if (statusChanges.length > 0) {
					statusChanges.forEach(change => {
						const { booking, oldStatus, newStatus } = change;
						const customerName = booking.customerInfo?.name || booking.user?.name || 'Customer';
						const serviceName = booking.serviceName || booking.service?.name || 'service';
						
						// Choose icon and color based on status
						let icon = '🔄';
						let statusText = newStatus;
						if (newStatus === 'confirmed') {
							icon = '✅';
							statusText = 'Confirmed';
						} else if (newStatus === 'cancelled') {
							icon = '❌';
							statusText = 'Cancelled';
						} else if (newStatus === 'completed') {
							icon = '✅';
							statusText = 'Completed';
						} else if (newStatus === 'pending') {
							icon = '⏳';
							statusText = 'Pending';
						}
						
						const notification = {
							id: `status-${booking._id}-${Date.now()}`,
							type: 'status',
							title: `${icon} Status Changed`,
							message: `${customerName}'s ${serviceName} is now ${statusText}`,
							time: new Date().toLocaleTimeString(),
							booking: booking,
							oldStatus,
							newStatus
						};
						setNotifications(prev => [notification, ...prev].slice(0, 20));
					});
				}
			}
      
			setBookings(newBookings);
      
			// Extract unique locations
			const uniqueLocations = [];
			const locationIds = new Set();
			newBookings.forEach(booking => {
				if (booking.location && booking.location.id && !locationIds.has(booking.location.id)) {
					locationIds.add(booking.location.id);
					uniqueLocations.push(booking.location);
				}
			});
			setLocations(uniqueLocations);
		} catch (error) {
			console.error('❌ Error fetching bookings:', error);
		}
	};

	const filterBookingsByLocation = () => {
		if (selectedLocation === 'all') {
			setFilteredBookings(bookings);
		} else {
			const filtered = bookings.filter(b => b.location?.id === selectedLocation);
			setFilteredBookings(filtered);
		}
	};

	const daysInMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	};

	const firstDayOfMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	};

	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'];

	const previousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
	};

	const nextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
	};

	const previousDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() - 1);
		setSelectedDate(newDate);
	};

	const nextDay = () => {
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + 1);
		setSelectedDate(newDate);
	};

	const goToToday = () => {
		setSelectedDate(new Date());
		setCurrentDate(new Date());
	};

	const renderCalendar = () => {
		const days = daysInMonth(currentDate);
		const firstDay = firstDayOfMonth(currentDate);
		const cells = [];

		// Previous month days
		const prevMonthDays = daysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
		for (let i = firstDay - 1; i >= 0; i--) {
			cells.push(
				<div key={`prev-${i}`} className="p-1 text-gray-400 text-center text-xs">
					{prevMonthDays - i}
				</div>
			);
		}

		// Current month days
		for (let day = 1; day <= days; day++) {
			const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
			const isToday = date.toDateString() === new Date().toDateString();
			const isSelected = date.toDateString() === selectedDate.toDateString();
			const dayBookings = filteredBookings.filter(b => 
				new Date(b.date).toDateString() === date.toDateString()
			);

			cells.push(
				<div
					key={day}
					onClick={() => setSelectedDate(date)}
					className={`p-1 text-center cursor-pointer border text-xs ${
						isToday ? 'bg-blue-500 text-white font-bold' :
						isSelected ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-100'
					}`}
				>
					<div>{day}</div>
				</div>
			);
		}

		return cells;
	};

	const getBookingsForSelectedDate = () => {
		return filteredBookings.filter(b => 
			new Date(b.date).toDateString() === selectedDate.toDateString()
		).sort((a, b) => a.time.localeCompare(b.time));
	};

	const getBookingsByBarberAndTime = () => {
		const bookingsForDate = getBookingsForSelectedDate();
		const timeSlots = [];
    
		// Generate time slots - Full 24 hours from 00:00 to 23:00 (24-hour format)
		for (let hour = 0; hour <= 23; hour++) {
			timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
		}

		return { bookingsForDate, timeSlots };
	};

	// Helper function to calculate how many slots a booking spans
	const getBookingSpan = (booking) => {
		if (!booking || !booking.time) return 1;
		
		const duration = booking.totalDuration || booking.service?.duration || 30; // default 30 minutes
		const slots = Math.ceil(duration / 60); // Each slot is 1 hour
		return Math.max(1, slots);
	};

	// Check if a booking should be displayed in this time slot
	const shouldShowBookingInSlot = (booking, timeSlot) => {
		if (!booking) return false;
		
		const bookingTime = parseTime(booking.time);
		if (!bookingTime) return false;

		// Parse 24-hour format time slot (HH:MM)
		const slotMatch = timeSlot.match(/(\d{1,2}):(\d{2})/);
		if (!slotMatch) return false;

		const slotHour = parseInt(slotMatch[1]);

		// Parse booking time (could be 12h or 24h format)
		const bookingMatch = bookingTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
		if (!bookingMatch) return false;

		let bookingHour = parseInt(bookingMatch[1]);
		const bookingMinutes = parseInt(bookingMatch[2]);
		const bookingPeriod = bookingMatch[3];

		// Convert to 24-hour if needed
		if (bookingPeriod) {
			const period = bookingPeriod.toUpperCase();
			if (period === 'PM' && bookingHour !== 12) bookingHour += 12;
			if (period === 'AM' && bookingHour === 12) bookingHour = 0;
		}

		// Calculate booking end time in hours
		const duration = booking.service?.duration || 30;
		const bookingStartMinutes = bookingHour * 60 + bookingMinutes;
		const bookingEndMinutes = bookingStartMinutes + duration;
		const bookingEndHour = bookingEndMinutes / 60;

		// Check if this slot falls within the booking's time range
		return slotHour >= bookingHour && slotHour < bookingEndHour;
	};

	const getCurrentTimeSlot = () => {
		const now = new Date();
		const hour = now.getHours();
		return `${hour.toString().padStart(2, '0')}:00`;
	};

	const isCurrentTimeSlot = (timeSlot) => {
		const now = new Date();
		const hour = now.getHours();
		const currentHour = `${hour.toString().padStart(2, '0')}:00`;
		return timeSlot === currentHour;
	};

	const getBookingEndTime = (booking) => {
		if (!booking.time) return null;
    
		const bookingTime = parseTime(booking.time);
		if (!bookingTime) return null;
    
		// Parse time (supports both 12h and 24h format)
		const match = bookingTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
		if (!match) return null;
    
		let hours = parseInt(match[1]);
		const minutes = parseInt(match[2]);
		const period = match[3];
    
		// Convert to 24h if needed
		if (period) {
			const p = period.toUpperCase();
			if (p === 'PM' && hours !== 12) hours += 12;
			if (p === 'AM' && hours === 12) hours = 0;
		}
    
		// Get duration from service object or use default
		let duration = 30; // default
		if (booking.service?.duration) {
			duration = booking.service.duration;
		} else if (typeof booking.service === 'string') {
			// For old bookings where service is a string, use default durations
			const serviceName = booking.service.toLowerCase();
			if (serviceName.includes('haircut') || serviceName.includes('fade')) {
				duration = 30;
			} else if (serviceName.includes('beard')) {
				duration = 20;
			} else if (serviceName.includes('shave')) {
				duration = 45;
			} else if (serviceName.includes('color')) {
				duration = 90;
			}
		}
    
		const totalMinutes = hours * 60 + minutes + duration;
		const endHours = Math.floor(totalMinutes / 60) % 24;  // Wrap at 24
		const endMinutes = totalMinutes % 60;
    
		// Return 24h format
		return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
	};

	const parseTime = (timeString) => {
		// Handle formats like "10:00 AM", "14:00", "10:00", "22:43"
		if (!timeString) return null;
    
		const time = timeString.trim();
    
		// If in 12h format (HH:MM AM/PM) - normalize it
		const match12h = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
		if (match12h) {
			const hour = parseInt(match12h[1]);
			const minutes = match12h[2];
			const period = match12h[3].toUpperCase();
			return `${hour}:${minutes} ${period}`;
		}
    
		// If in 24h format (HH:MM), convert to 12h
		const match24h = time.match(/^(\d{1,2}):(\d{2})$/);
		if (match24h) {
			let hours = parseInt(match24h[1]);
			const minutes = match24h[2];
			const period = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12 || 12;
			return `${hours}:${minutes} ${period}`;
		}
    
		return null;
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed': return 'border-l-4 border-green-500 bg-green-50';
			case 'pending': return 'border-l-4 border-cyan-500 bg-cyan-50';
			case 'completed': return 'border-l-4 border-blue-500 bg-blue-50';
			case 'cancelled': return 'border-l-4 border-red-500 bg-red-50';
			default: return 'border-l-4 border-gray-500 bg-gray-50';
		}
	};

	const formatTime = (time) => {
		return time;
	};



	return (
		<AdminLayout notifications={notifications}>
			<div className="flex h-full bg-gray-50">
				{/* Left Sidebar */}
				<div className="w-64 bg-white border-r p-4 flex flex-col h-full">
					{/* Action Buttons */}
					<div className="space-y-2 mb-6">
						<button className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium shadow-sm">
							<CalendarIcon className="w-4 h-4" />
							New sale
						</button>
						<button className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-between font-medium shadow-sm"
							onClick={() => {
								// Reset form and open create modal
								setNewAppointmentData({
									date: new Date().toISOString().split('T')[0],
									time: '',
									barber: '',
									service: '',
									customerName: '',
									customerEmail: '',
									customerPhone: '',
									notes: ''
								});
								setShowCreateAppointmentModal(true);
							}}
						>
							<div className="flex items-center gap-2">
								<Plus className="w-4 h-4" />
								Create...
							</div>
							<ChevronDown className="w-4 h-4" />
						</button>
					</div>

					{/* Mini Calendar */}
					<div className="mb-4">
						<div className="flex items-center justify-between mb-4">
							<button onClick={previousMonth} className="hover:bg-gray-100 p-1 rounded">
								<ChevronLeft className="w-5 h-5" />
							</button>
							<span className="font-semibold text-sm">
								{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
							</span>
							<button onClick={nextMonth} className="hover:bg-gray-100 p-1 rounded">
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>

						<div className="grid grid-cols-7 gap-1 text-xs">
							{['P', 'A', 'T', 'K', 'P', 'S', 'S'].map((day, i) => (
								<div key={i} className="text-center font-semibold text-gray-500 py-1">{day}</div>
							))}
							{renderCalendar()}
						</div>
					</div>

					{/* Spacer to push links to bottom */}
					<div className="flex-1"></div>

					{/* Sidebar Links */}
					<div className="space-y-1 mb-6">
						<a href="#" className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-100 rounded text-sm text-gray-700">
							<Lightbulb className="w-4 h-4" />
							Recommend a salon
						</a>
						<a href="#" className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-100 rounded text-sm text-gray-700">
							<BookOpen className="w-4 h-4" />
							Help articles
						</a>
						<a href="#" className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-100 rounded text-sm text-gray-700">
							<Sparkles className="w-4 h-4" />
							What's new
						</a>
					</div>

					{/* Chat Support */}
					<div>
						<button className="w-full bg-indigo-100 text-indigo-700 py-2.5 px-4 rounded-lg hover:bg-indigo-200 transition font-medium">
							Chat support
						</button>
						<div className="mt-4 text-xs text-gray-500">
							<p className="font-semibold mb-1">Shortcut keys</p>
						</div>
					</div>
				</div>

				{/* Main Calendar Area */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Top Bar with Info + Date Navigation - Combined Header */}
					<div className="bg-white border-b">

						{/* Date Navigation */}
						<div className="flex items-center justify-between px-6 py-3">
							<div className="flex items-center space-x-3">
								<button onClick={previousDay} className="p-1.5 hover:bg-gray-200 rounded border border-gray-300">
									<ChevronLeft className="w-4 h-4" />
								</button>
								<div className="bg-white px-4 py-2 rounded-lg border border-gray-300">
									<span className="font-medium text-sm">
										{selectedDate.toLocaleDateString('en-US', { 
											weekday: 'short',
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										})}
										{selectedDate.toDateString() === new Date().toDateString() && ', Today'}
									</span>
								</div>
								<button onClick={nextDay} className="p-1.5 hover:bg-gray-200 rounded border border-gray-300">
									<ChevronRight className="w-4 h-4" />
								</button>
														
								{/* Location Selector */}
								<select
									value={selectedLocation}
									onChange={(e) => setSelectedLocation(e.target.value)}
									className="ml-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
								>
									<option value="all">All Locations</option>
									<option value="location-1">OLDTOWN Branch</option>
									<option value="location-2">BIG VILNIUS Branch</option>
								</select>
							</div>

							<div className="flex items-center space-x-2">
								<button
									onClick={() => setViewMode('day')}
									className={`px-4 py-1.5 text-sm rounded-md ${viewMode === 'day' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
								>
									Day
								</button>
								<button
									onClick={() => setViewMode('week')}
									className={`px-4 py-1.5 text-sm rounded-md ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}
								>
									Week
								</button>
							</div>
						</div>
					</div>

					{/* Barber Column Calendar View */}
					<div className="flex-1 overflow-hidden">
						{barbers.length === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
								<p>No barbers added yet. Please add team members first.</p>
							</div>
						) : (
							<div className="h-full flex flex-col overflow-hidden">
								{/* Header with Barber Names */}
								<div className="sticky top-0 bg-white border-b shadow-sm z-10" style={{ display: 'grid', gridTemplateColumns: `80px repeat(${barbers.length}, 1fr)` }}>
									<div className="p-3 font-semibold text-sm text-center bg-gray-50 border-r border-gray-100">Time</div>
									{barbers.map((barber) => {
										return (
											<div key={barber._id} className="p-3 flex items-center justify-start space-x-2.5 border-r border-gray-100 last:border-r-0 bg-white">
												{barber.profileImage ? (
													<img 
														src={barber.profileImage} 
														alt={barber.name}
														className="w-9 h-9 rounded-full object-cover shadow-md border-2 border-gray-200"
													/>
												) : (
													<div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold shadow-md">
														{barber.name.charAt(0).toUpperCase()}
													</div>
												)}
												<div className="text-left">
													<div className="text-sm font-semibold text-gray-900 truncate">{barber.name}</div>
													{barber.specialties?.length > 0 && (
														<div className="text-[10px] text-gray-500 truncate">{barber.specialties[0]}</div>
													)}
												</div>
											</div>
										);
									})}
								</div>

							{/* Time Slots and Appointments */}
							<div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
								{(() => {
									const { bookingsForDate, timeSlots } = getBookingsByBarberAndTime();

									// Removed auto-scroll - let user control scrolling

									return timeSlots.map((timeSlot, timeSlotIndex) => (
										<div
											key={timeSlot}
											id={`time-slot-${timeSlot}`}
											className={`border-t border-gray-100 ${isCurrentTimeSlot(timeSlot) ? 'bg-yellow-50 ring-1 ring-yellow-300' : ''}`}
											style={{ 
												display: 'grid', 
												gridTemplateColumns: `80px repeat(${barbers.length}, 1fr)`,
												minHeight: '80px'
											}}
										>
											{/* Time Label */}
											<div className={`p-3 text-xs font-semibold border-r border-gray-100 text-center flex items-center justify-center ${
												isCurrentTimeSlot(timeSlot) ? 'bg-yellow-100 text-yellow-900' : 'bg-gray-50'
											}`}>
												{timeSlot}
												{isCurrentTimeSlot(timeSlot) && <Clock className="w-3 h-3 ml-1 inline" />}
											</div>

											{/* Barber Appointment Cells */}
											{barbers.map((barber) => {
												// Find booking that starts in this slot
												const bookingStartsHere = bookingsForDate.find((b) => {
													const bookingBarberId = b.barber?._id || b.barber;
													const barberMatches = bookingBarberId === barber._id;
												
													if (!barberMatches) return false;
												
													const bookingTime = parseTime(b.time);
													if (!bookingTime) return false;
												
													// Parse booking time (supports 12h and 24h format)
													const bookingMatch = bookingTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
													if (!bookingMatch) return false;
												
													let bookingHour = parseInt(bookingMatch[1]);
													const bookingPeriod = bookingMatch[3];
												
													// Convert to 24h if AM/PM present
													if (bookingPeriod) {
														const period = bookingPeriod.toUpperCase();
														if (period === 'PM' && bookingHour !== 12) bookingHour += 12;
														if (period === 'AM' && bookingHour === 12) bookingHour = 0;
													}
												
													// Parse time slot (24h format)
													const slotMatch = timeSlot.match(/(\d{1,2}):(\d{2})/);
													if (!slotMatch) return false;
												
													const slotHour = parseInt(slotMatch[1]);
												
													// Only match if booking STARTS in this slot
													return bookingHour === slotHour;
												});

												// Check if a booking is spanning through this slot
												const bookingSpanning = bookingsForDate.find((b) => {
													const bookingBarberId = b.barber?._id || b.barber;
													if (bookingBarberId !== barber._id) return false;
													return shouldShowBookingInSlot(b, timeSlot) && !bookingStartsHere;
												});

												const booking = bookingStartsHere || bookingSpanning;
												const endTime = booking ? getBookingEndTime(booking) : null;
												const isFirstSlot = !!bookingStartsHere;
												
												// Check if this is in the bottom half of the list (for tooltip positioning)
												const isBottomHalf = timeSlotIndex > timeSlots.length / 2;
												// Check if this is on the right side (last 2 barbers) to show tooltip on left
												const barberIndex = barbers.findIndex(b => b._id === barber._id);
												const isRightSide = barberIndex >= barbers.length - 2;

												return (
													<div
														key={`${barber._id}-${timeSlot}`}
														className="border-l border-gray-100 p-1.5 min-h-[80px] relative"
														onMouseEnter={() => booking && setHoveredBooking(booking)}
														onMouseLeave={() => setHoveredBooking(null)}
													>
														{/* Show full booking card only in first slot */}
														{booking && isFirstSlot && (
															<>
																<div
																	className="absolute left-1.5 right-1.5 bg-white border border-gray-200 rounded shadow-md p-2.5 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-600 z-20"
																	style={{
																		top: '4px',
																		height: `${(getBookingSpan(booking) * 80) - 8}px`,
																		overflow: 'visible'
																	}}
																	onClick={() => {
																		setSelectedBooking(booking);
																		setShowDetailModal(true);
																	}}
																>
																	<div className="flex justify-between items-start mb-1">
																		<div className="text-[10px] text-gray-500">
																			{parseTime(booking.time)} - {endTime || 'N/A'}
																		</div>
																		<button className="text-gray-400 hover:text-gray-600 text-xs">
																			<MoreVertical className="w-3 h-3" />
																		</button>
																	</div>
																	<div className="font-bold text-gray-900 text-[13px] mb-0.5 truncate">
																		{booking.customerInfo?.name || booking.user?.name || 'Unknown Customer'}
																	</div>
																	<div className="text-[11px] text-indigo-600 truncate">
																		{booking.serviceName || booking.service?.name || 'Service'}
																	</div>
																</div>

																{/* Hover Tooltip */}
																{hoveredBooking?._id === booking._id && (
																	<div 
																		className="fixed w-80 bg-white border-2 border-blue-400 rounded-lg shadow-2xl p-4 z-[100] pointer-events-auto max-h-[90vh] overflow-y-auto"
																		onMouseEnter={() => setHoveredBooking(booking)}
																		onMouseLeave={() => setHoveredBooking(null)}
																		style={{
																			top: isBottomHalf ? 'auto' : '80px',
																			bottom: isBottomHalf ? '20px' : 'auto',
																			left: isRightSide ? 'auto' : `${barberIndex * 200 + 400}px`,
																			right: isRightSide ? '20px' : 'auto',
																		}}
																	>
																		<button 
																			onClick={(e) => {
																				e.stopPropagation();
																				setHoveredBooking(null);
																			}}
																			className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
																		>
																			<X className="w-4 h-4" />
																		</button>

																		<div className="space-y-3 pr-2">
																			{/* Header */}
																			<div className="pb-2 border-b">
																				<h3 className="text-lg font-bold text-gray-900">
																					{booking.customerInfo?.name || booking.user?.name || 'Unknown'}
																				</h3>
																				<p className="text-sm text-gray-600">
																					{booking.customerInfo?.phone || booking.user?.phone || 'No phone'}
																				</p>
																				<span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-bold ${
																					booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
																					booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
																					booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
																					'bg-red-100 text-red-800'
																				}`}>
																					{booking.status.toUpperCase()}
																				</span>
																				{booking.isPaid ? (
																					<span className="inline-block mt-2 ml-2 px-2 py-1 text-xs rounded-full font-bold bg-green-100 text-green-800">
																						✓ PAID
																					</span>
																				) : (
																					<span className="inline-block mt-2 ml-2 px-2 py-1 text-xs rounded-full font-bold bg-red-100 text-red-800">
																						UNPAID
																					</span>
																				)}
																			</div>

																			{/* Details */}
																			<div>
																				<p className="text-xs text-gray-600 font-bold flex items-center gap-1">
																					<CalendarIcon className="w-3 h-3" /> DATE & TIME
																				</p>
																				<p className="text-sm font-semibold mt-1">
																					{new Date(booking.date).toLocaleDateString('en-US', { 
																						weekday: 'short',
																						month: 'short', 
																						day: 'numeric'
																					})} • {booking.time} - {endTime}
																				</p>
																			</div>

																			<div>
																				<p className="text-xs text-gray-600 font-bold flex items-center gap-1">
																					<Scissors className="w-3 h-3" /> SERVICE
																				</p>
																				<p className="text-sm mt-1">{booking.serviceName || booking.service?.name || 'N/A'}</p>
																			</div>

																			{booking.barber && (
																				<div>
																					<p className="text-xs text-gray-600 font-bold flex items-center gap-1">
																						<User className="w-3 h-3" /> BARBER
																					</p>
																					<p className="text-sm mt-1">{booking.barber.name}</p>
																				</div>
																			)}

																			{booking.location && (
																				<div>
																					<p className="text-xs text-gray-600 font-bold flex items-center gap-1">
																						<MapPin className="w-3 h-3" /> LOCATION
																					</p>
																					<p className="text-sm mt-1">{booking.location.name}</p>
																					{booking.location.address && (
																						<p className="text-xs text-gray-500 mt-1">{booking.location.address}</p>
																					)}
																				</div>
																			)}

																			<div>
																				<p className="text-xs text-gray-600 font-bold flex items-center gap-1">
																					<Timer className="w-3 h-3" /> DURATION
																				</p>
																				<p className="text-sm mt-1">{booking.service?.duration || 30} minutes</p>
																			</div>

																			<div>
																				<p className="text-xs text-gray-600 font-bold flex items-center gap-1">
																					<DollarSign className="w-3 h-3" /> PRICE
																				</p>
																				<p className="text-sm font-bold mt-1">
																					${booking.price || 0}
																					<span className={`text-xs ml-2 px-2 py-0.5 rounded ${
																						booking.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
																					}`}>
																						{booking.isPaid ? 'Paid' : 'Unpaid'}
																					</span>
																				</p>
																			</div>

																			<div className="text-xs text-gray-500 pt-2 border-t">
																				Booked: {new Date(booking.createdAt).toLocaleString()}
																			</div>
																		</div>
																	</div>
																)}
															</>
														)}
													</div>
												);
											})}
										</div>
									));
								})()}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Appointment Detail Modal */}
			{showDetailModal && selectedBooking && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[200] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="bg-gray-100 px-6 py-4 border-b flex items-center justify-between">
							<div>
								<h2 className="text-lg font-bold text-gray-800">
									{(selectedBooking.customerInfo?.name || selectedBooking.user?.name || 'CUSTOMER').toUpperCase()}
								</h2>
								<p className="text-sm text-gray-600">
									{new Date(selectedBooking.date).toLocaleDateString('en-US', { 
										month: 'long', 
										day: 'numeric' 
									})}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{/* <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
									<MessageCircle className="w-5 h-5" />
								</button> */}
								<button 
									className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
									onClick={() => {
										console.log('UserCircle button clicked');
										console.log('selectedBooking:', selectedBooking);
										console.log('isGuestBooking:', selectedBooking?.isGuestBooking);
										console.log('customerInfo:', selectedBooking?.customerInfo);
										console.log('user:', selectedBooking?.user);
																	
										if (selectedBooking?.user?._id) {
											// Regular user with account
											fetchCustomerDetails(selectedBooking.user._id);
										} else if (selectedBooking?.customerInfo?.email) {
											// Guest booking or booking without user account - fetch by email
											console.log('Fetching by email:', selectedBooking.customerInfo.email);
											fetchCustomerDetailsByEmail(selectedBooking.customerInfo.email);
										} else {
											alert('❌ Customer information not available for this booking');
										}
									}}
									title="Customer Details"
								>
									<UserCircle className="w-5 h-5" />
								</button>
								<button 
									className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
									onClick={() => {
										if (selectedBooking?.isGuestBooking) {
											// Guest customer - use customerInfo
											setEditCustomerData({
												name: selectedBooking.customerInfo?.name || '',
												phone: selectedBooking.customerInfo?.phone || '',
												email: selectedBooking.customerInfo?.email || '',
												marketingConsent: false,
												prepaymentRequired: false,
												gender: 'Other / Prefers not to disclose',
												birthMonth: '',
												birthDay: '',
												birthYear: '',
												note: ''
											});
										} else {
											// Regular user
											setEditCustomerData({
												name: selectedBooking.user?.name || '',
												phone: selectedBooking.user?.phone || '',
												email: selectedBooking.user?.email || '',
												marketingConsent: selectedBooking.user?.marketingConsent || false,
												prepaymentRequired: selectedBooking.user?.prepaymentRequired || false,
												gender: selectedBooking.user?.gender || 'Other / Prefers not to disclose',
												birthMonth: selectedBooking.user?.birthMonth || '',
												birthDay: selectedBooking.user?.birthDay || '',
												birthYear: selectedBooking.user?.birthYear || '',
												note: selectedBooking.user?.note || ''
											});
										}
										setShowEditCustomerModal(true);
									}}
								>
									<Edit className="w-5 h-5" />
								</button>
								<button 
									onClick={() => {
										setShowDetailModal(false);
										setSelectedBooking(null);
									}}
									className="text-gray-500 hover:text-gray-700 transition"
								>
									<X className="w-6 h-6" />
								</button>
							</div>
						</div>

						{/* Content */}
						<div className="p-6">
							{/* Status Badge */}
							<div className="mb-6">
								<span className="inline-block px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded">
									VISITED BEFORE
								</span>
								{selectedBooking.isPaid ? (
									<span className="inline-block ml-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">
										✓ PAID
									</span>
								) : (
									<span className="inline-block ml-2 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded">
										UNPAID
									</span>
								)}
							</div>

							{/* Customer Info */}
							<div className="mb-6">
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									{selectedBooking.customerInfo?.name || selectedBooking.user?.name || 'Customer Name'}
								</h3>
								<div className="flex items-center gap-4 text-sm text-gray-600">
									<div className="flex items-center gap-2">
										<Phone className="w-4 h-4" />
										<span>{selectedBooking.customerInfo?.phone || selectedBooking.user?.phone || 'No phone'}</span>
									</div>
									<div className="flex items-center gap-2">
										<Mail className="w-4 h-4" />
										<span>{selectedBooking.customerInfo?.email || selectedBooking.user?.email || 'No email'}</span>
									</div>
								</div>
								{selectedBooking.isGuestBooking && (
									<div className="mt-2">
										<span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
											GUEST BOOKING
										</span>
									</div>
								)}
							</div>

							{/* DONE Section */}
							<div className="mb-6 pb-6 border-b">
								<h4 className="text-sm font-semibold text-green-600 mb-3">DONE</h4>
								<div className="text-lg text-gray-800">
									{selectedBooking.serviceName || selectedBooking.service?.name || 'Simple haircut / Haircut'}
								</div>
								<div className="mt-4 grid grid-cols-3 gap-4 text-sm">
									<div>
										<p className="text-gray-600">Date</p>
										<p className="font-semibold">
											{new Date(selectedBooking.date).toLocaleDateString('en-US', {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit'
											})}
										</p>
										<p className="font-semibold">{selectedBooking.time}</p>
									</div>
									<div>
										<p className="text-gray-600">Duration</p>
										<p className="font-semibold">{selectedBooking.service?.duration || 50} minutes</p>
									</div>
									<div>
										<p className="text-gray-600">Employee</p>
										<p className="font-semibold">{selectedBooking.barber?.name || 'David'} (Selected)</p>
									</div>
								</div>
								<div className="mt-3 text-sm text-gray-600">
									ends at {getBookingEndTime(selectedBooking) || '17:35'}
								</div>
							</div>

							{/* Order Info */}
							<div className="mb-6 pb-6 border-b">
								<div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
									<span className={`px-2 py-1 rounded text-xs font-medium ${
										selectedBooking.source === 'Website' ? 'bg-blue-100 text-blue-800' :
										selectedBooking.source === 'Treatwell' ? 'bg-green-100 text-green-800' :
										selectedBooking.source === 'Walk-in' ? 'bg-purple-100 text-purple-800' :
										selectedBooking.source === 'Phone' ? 'bg-orange-100 text-orange-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{selectedBooking.source || 'Website'}
									</span>
									<span>Order date: {new Date(selectedBooking.createdAt).toLocaleDateString('en-US', {
										day: 'numeric',
										month: 'short',
										year: 'numeric'
									})} via {selectedBooking.source || 'Website'} (
									<span className="text-blue-600">0% fee</span>
									). Order number {selectedBooking._id?.slice(-10) || 'T2167259190'}</span>
								</div>
								<button 
									onClick={() => {
										setCommentText('');
										setShowCommentModal(true);
									}}
									className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
								>
									<MessageCircle className="w-4 h-4" />
									Add a comment
								</button>
								
								{/* Display existing comments */}
								{selectedBooking.comments && selectedBooking.comments.length > 0 && (
									<div className="mt-4 space-y-3">
										<h5 className="text-xs font-semibold text-gray-600">COMMENTS</h5>
										{selectedBooking.comments.map((comment, index) => (
											<div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
												<div className="flex items-start justify-between mb-1">
													<span className="text-xs font-semibold text-gray-700">{comment.createdBy}</span>
													<span className="text-xs text-gray-500">
														{new Date(comment.createdAt).toLocaleDateString('en-US', {
															month: 'short',
															day: 'numeric',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit'
														})}
													</span>
												</div>
												<p className="text-sm text-gray-700">{comment.text}</p>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Operations Section */}
							<div className="mb-6">
								<h4 className="text-sm font-semibold text-gray-800 mb-3">OPERATIONS</h4>
								<div className="bg-gray-50 rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="text-blue-600 font-medium">
											{new Date(selectedBooking.date).toLocaleDateString('en-US', {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit'
											})} {selectedBooking.time}
										</div>
										<div className="flex items-center gap-2">
											<span className="text-sm">1 service</span>
											<span className="font-bold">${selectedBooking.price || '24.99'}€</span>
										</div>
									</div>
								</div>
							</div>
							
							{/* Action Buttons */}
							<div className="space-y-3">
								{/* Charge Payment Button - Show only if unpaid */}
								{!selectedBooking.isPaid && selectedBooking.cardSetupComplete && (
									<button 
										className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
										onClick={() => handleChargePayment(selectedBooking._id)}
									>
										<CreditCard className="w-5 h-5" />
										Charge Payment (${selectedBooking.price || selectedBooking.totalPrice || '0'})
									</button>
								)}
								
								<div className="flex gap-3">
									<button 
										className="flex-1 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2"
										onClick={() => {
											// Populate edit form with current booking data
											setEditAppointmentData({
												date: new Date(selectedBooking.date).toISOString().split('T')[0],
												time: selectedBooking.time,
												barber: selectedBooking.barber?._id || '',
												service: selectedBooking.service?._id || '',
												notes: selectedBooking.notes || ''
											});
											setShowEditAppointmentModal(true);
										}}
									>
										<Edit className="w-5 h-5" />
										Edit Appointment
									</button>
									<button 
										className="flex-1 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2"
										onClick={handleRepeatBooking}
									>
										<Repeat className="w-5 h-5" />
										Repeat
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit Customer Modal */}
			{showEditCustomerModal && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[400] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="px-6 py-4 border-b flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-700">Customer</h2>
							<button 
								onClick={() => setShowEditCustomerModal(false)}
								className="text-gray-500 hover:text-gray-700 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Form Content */}
						<div className="p-6">
							{/* Name Field */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Name and surname <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={editCustomerData.name}
									onChange={(e) => setEditCustomerData({...editCustomerData, name: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="Enter name"
								/>
							</div>

							{/* Phone and Email */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
									<input
										type="tel"
										value={editCustomerData.phone}
										onChange={(e) => setEditCustomerData({...editCustomerData, phone: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="+370 656 54498"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
									<input
										type="email"
										value={editCustomerData.email}
										onChange={(e) => setEditCustomerData({...editCustomerData, email: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
										placeholder="email@example.com"
									/>
								</div>
							</div>

							{/* Marketing Consent */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Consent to marketing messages
								</label>
								<div className="flex items-start">
									<input
										type="checkbox"
										checked={editCustomerData.marketingConsent}
										onChange={(e) => setEditCustomerData({...editCustomerData, marketingConsent: e.target.checked})}
										className="mt-1 mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
									/>
									<span className="text-sm text-gray-600">
										I confirm that I have received clear, informed and freely given consent from the client to receive marketing messages and other marketing messages.{' '}
										<a href="#" className="text-indigo-600 underline">Learn more about GDPR requirements.</a>
									</span>
								</div>
							</div>

							{/* Prepayment Required */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Prepayment required
								</label>
								<div className="flex items-start">
									<input
										type="checkbox"
										checked={editCustomerData.prepaymentRequired}
										onChange={(e) => setEditCustomerData({...editCustomerData, prepaymentRequired: e.target.checked})}
										className="mt-1 mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
									/>
									<span className="text-sm text-gray-600">
										A client must pay in advance to book an appointment with your salon online.
									</span>
								</div>
							</div>

							{/* Gender */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
								<select
									value={editCustomerData.gender}
									onChange={(e) => setEditCustomerData({...editCustomerData, gender: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
								>
									<option>Other / Prefers not to disclose</option>
									<option>Male</option>
									<option>Female</option>
								</select>
							</div>

							{/* Date of Birth */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
								<div className="grid grid-cols-3 gap-3">
									<div>
										<label className="block text-xs text-gray-500 mb-1">Month of birth</label>
										<select
											value={editCustomerData.birthMonth}
											onChange={(e) => setEditCustomerData({...editCustomerData, birthMonth: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
										>
											<option value="">Month</option>
											{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
												<option key={idx} value={idx + 1}>{month}</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-xs text-gray-500 mb-1">Birthday</label>
										<input
											type="number"
											value={editCustomerData.birthDay}
											onChange={(e) => setEditCustomerData({...editCustomerData, birthDay: e.target.value})}
											placeholder="Day"
											min="1"
											max="31"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
										/>
									</div>
									<div>
										<label className="block text-xs text-gray-500 mb-1">Year of birth</label>
										<input
											type="number"
											value={editCustomerData.birthYear}
											onChange={(e) => setEditCustomerData({...editCustomerData, birthYear: e.target.value})}
											placeholder="Year"
											min="1900"
											max={new Date().getFullYear()}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
										/>
									</div>
								</div>
							</div>

							{/* Note */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
								<textarea
									value={editCustomerData.note}
									onChange={(e) => setEditCustomerData({...editCustomerData, note: e.target.value})}
									rows="3"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="Add notes about the customer..."
								/>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 justify-end">
								<button 
									onClick={() => setShowEditCustomerModal(false)}
									className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition font-medium"
								>
									Cancel
								</button>
								<button 
									onClick={async () => {
										// Check if we're editing from appointment detail or customer info modal
										if (selectedBooking?.user?._id) {
											// Editing from appointment detail modal
											try {
												const userId = selectedBooking.user._id;
												await authAPI.updateUser(userId, {
													name: editCustomerData.name,
													phone: editCustomerData.phone,
													email: editCustomerData.email,
													gender: editCustomerData.gender,
													birthMonth: editCustomerData.birthMonth,
													birthDay: editCustomerData.birthDay,
													birthYear: editCustomerData.birthYear,
													marketingConsent: editCustomerData.marketingConsent,
													prepaymentRequired: editCustomerData.prepaymentRequired,
													note: editCustomerData.note,
												});
												await fetchBookings();
												alert('✅ Customer information updated successfully!');
												setShowEditCustomerModal(false);
											} catch (error) {
												console.error('Error saving customer data:', error);
												alert('❌ Failed to update customer information');
											}
										} else {
											// Editing from customer info modal
											handleSaveEditCustomer();
										}
									}}
									className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
								>
									Store
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			
			{/* Edit Appointment Modal */}
			{showEditAppointmentModal && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[400] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="px-6 py-4 border-b flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-700">Edit Appointment</h2>
							<button 
								onClick={() => setShowEditAppointmentModal(false)}
								className="text-gray-500 hover:text-gray-700 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
			
						{/* Form */}
						<div className="p-6 space-y-4">
							{/* Date */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
								<input
									type="date"
									value={editAppointmentData.date}
									onChange={(e) => setEditAppointmentData({...editAppointmentData, date: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
								/>
							</div>
			
							{/* Time */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Time (24-hour format)</label>
								<input
									type="time"
									value={editAppointmentData.time}
									onChange={(e) => setEditAppointmentData({...editAppointmentData, time: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
								/>
							</div>
			
							{/* Barber */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Barber/Employee</label>
								<select
									value={editAppointmentData.barber}
									onChange={(e) => setEditAppointmentData({...editAppointmentData, barber: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="">Select barber...</option>
									{barbers.map((barber) => (
										<option key={barber._id} value={barber._id}>{barber.name}</option>
									))}
								</select>
							</div>
			
							{/* Service */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
								<select
									value={editAppointmentData.service}
									onChange={(e) => setEditAppointmentData({...editAppointmentData, service: e.target.value})}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="">Select service...</option>
									{services.map((service) => (
										<option key={service._id} value={service._id}>
											{service.name} - €{service.price} ({service.duration}min)
										</option>
									))}
								</select>
							</div>
			
							{/* Notes */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
								<textarea
									value={editAppointmentData.notes}
									onChange={(e) => setEditAppointmentData({...editAppointmentData, notes: e.target.value})}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
									placeholder="Any special requests or notes..."
								/>
							</div>
						</div>
			
						{/* Footer */}
						<div className="px-6 py-4 border-t flex justify-end gap-3">
							<button
								onClick={() => setShowEditAppointmentModal(false)}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
							>
								Cancel
							</button>
							<button
								onClick={async () => {
									try {
										const updateData = {
											date: editAppointmentData.date,
											time: editAppointmentData.time,
											barber: editAppointmentData.barber,
											service: editAppointmentData.service,
											notes: editAppointmentData.notes
										};
											
										await bookingsAPI.update(selectedBooking._id, updateData);
										await fetchBookings();
										alert('✅ Appointment updated successfully!');
										setShowEditAppointmentModal(false);
										setShowDetailModal(false);
									} catch (error) {
										console.error('Error updating appointment:', error);
										alert('❌ Failed to update appointment: ' + (error.response?.data?.message || error.message));
									}
								}}
								className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
							>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}
				
			{/* Create Appointment Modal */}
			{showCreateAppointmentModal && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[400] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="px-6 py-4 border-b flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-700">Create New Appointment</h2>
							<button 
								onClick={() => setShowCreateAppointmentModal(false)}
								className="text-gray-500 hover:text-gray-700 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
			
						{/* Form */}
						<div className="p-6 space-y-4">
							{/* Customer Information */}
							<div className="pb-4 border-b">
								<h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
										<input
											type="text"
											value={newAppointmentData.customerName}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, customerName: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											placeholder="John Doe"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
										<input
											type="email"
											value={newAppointmentData.customerEmail}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, customerEmail: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											placeholder="john@example.com"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
										<input
											type="tel"
											value={newAppointmentData.customerPhone}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, customerPhone: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											placeholder="+1234567890"
											required
										/>
									</div>
								</div>
							</div>
			
							{/* Appointment Details */}
							<div>
								<h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Details</h3>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
										<input
											type="date"
											value={newAppointmentData.date}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, date: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											required
										/>
									</div>
			
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Time (24-hour format) *</label>
										<input
											type="time"
											value={newAppointmentData.time}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, time: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											required
										/>
									</div>
			
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Barber/Employee *</label>
										<select
											value={newAppointmentData.barber}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, barber: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											required
										>
											<option value="">Select barber...</option>
											{barbers.map((barber) => (
												<option key={barber._id} value={barber._id}>{barber.name}</option>
											))}
										</select>
									</div>
			
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
										<select
											value={newAppointmentData.service}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, service: e.target.value})}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											required
										>
											<option value="">Select service...</option>
											{services.map((service) => (
												<option key={service._id} value={service._id}>
													{service.name} - €{service.price} ({service.duration}min)
												</option>
											))}
										</select>
									</div>
			
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
										<textarea
											value={newAppointmentData.notes}
											onChange={(e) => setNewAppointmentData({...newAppointmentData, notes: e.target.value})}
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
											placeholder="Any special requests or notes..."
										/>
									</div>
								</div>
							</div>
						</div>
			
						{/* Footer */}
						<div className="px-6 py-4 border-t flex justify-end gap-3">
							<button
								onClick={() => setShowCreateAppointmentModal(false)}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
							>
								Cancel
							</button>
							<button
								onClick={async () => {
									try {
										// Validation
										if (!newAppointmentData.customerName || !newAppointmentData.customerEmail || 
											!newAppointmentData.customerPhone || !newAppointmentData.date || 
											!newAppointmentData.time || !newAppointmentData.barber || 
											!newAppointmentData.service) {
											alert('❌ Please fill in all required fields');
											return;
										}
			
										const bookingData = {
											customerInfo: {
												name: newAppointmentData.customerName,
												email: newAppointmentData.customerEmail,
												phone: newAppointmentData.customerPhone
											},
											date: newAppointmentData.date,
											time: newAppointmentData.time,
											barber: newAppointmentData.barber,
											services: [{ serviceId: newAppointmentData.service }],
											notes: newAppointmentData.notes,
											source: 'Walk-in'
										};
											
										// Use guest booking API
										await api.post('/guest-bookings', bookingData);
										await fetchBookings();
										alert('✅ Appointment created successfully!');
										setShowCreateAppointmentModal(false);
									} catch (error) {
										console.error('Error creating appointment:', error);
										alert('❌ Failed to create appointment: ' + (error.response?.data?.message || error.message));
									}
								}}
								className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
							>
								Create Appointment
							</button>
						</div>
					</div>
				</div>
			)}
				
			{/* Customer Information Modal */}
			{showCustomerInfoModal && customerDetails && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[300] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
						{/* Header */}
						<div className="px-6 py-4 border-b flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-800">Customer information</h2>
							<button 
								onClick={() => {
									setShowCustomerInfoModal(false);
									setCustomerDetails(null);
								}}
								className="text-gray-500 hover:text-gray-700 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							{/* Customer Profile Section */}
							<div className="flex items-start gap-4 mb-6">
								{/* Profile Image */}
								<div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
									<User className="w-12 h-12 text-gray-400" />
								</div>

								{/* Customer Info */}
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="text-xl font-bold text-gray-900">
											{customerDetails.customer?.name || 'Customer Name'}
										</h3>
										<button 
											onClick={handleEditCustomerClick}
											className="text-blue-600 hover:text-blue-800 text-sm"
										>
											Edit data
										</button>
									</div>
									<div className="mb-2">
										{customerDetails.bookings && customerDetails.bookings.length > 0 && customerDetails.bookings[0].source && (
											<>
												<span className={`inline-block px-2 py-1 text-white text-xs rounded font-medium ${
													customerDetails.bookings[0].source === 'Website' ? 'bg-blue-500' :
													customerDetails.bookings[0].source === 'Treatwell' ? 'bg-green-500' :
													customerDetails.bookings[0].source === 'Walk-in' ? 'bg-purple-500' :
													customerDetails.bookings[0].source === 'Phone' ? 'bg-orange-500' :
													'bg-gray-500'
												}`}>
													{customerDetails.bookings[0].source.toLowerCase()}
												</span>
												<span className="ml-2 text-sm text-gray-600">Came through</span>
											</>
										)}
									</div>
									<div className="space-y-1 text-sm">
										<div className="flex items-center gap-2">
											<span className="font-medium text-gray-700">Phone</span>
											<span className="text-gray-900">{customerDetails.customer?.phone || 'Not provided'}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium text-gray-700">Email</span>
											<span className="text-gray-900">{customerDetails.customer?.email || 'Not provided'}</span>
										</div>
										<div className="flex items-center gap-2 text-green-600">
											<Check className="w-4 h-4" />
											<span>Agree to receive newsletters</span>
										</div>
										<div className="flex items-center gap-2 text-orange-600">
											<DollarSign className="w-4 h-4" />
											<span>Prepayment required</span>
										</div>
									</div>
								</div>

								{/* Info Box */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xs">
									<p className="text-sm text-blue-900 mb-2">
										You won't pay commission for repeat customers. This applies to orders placed through Treatwell, the booking plugin, or manually entered.
									</p>
									<p className="text-sm text-blue-900">
										Want to know more about our pricing?{' '}
										<a href="#" className="text-blue-700 underline font-medium">Learn more</a>
									</p>
								</div>
							</div>

							{/* Tabs */}
							<div className="border-b mb-6">
								<div className="flex gap-6">
									<button className="pb-2 border-b-2 border-indigo-600 text-indigo-600 font-medium text-sm">
										History <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full ml-1 text-xs">{customerDetails.totalBookings || 0}</span>
									</button>
									<button className="pb-2 text-gray-600 hover:text-gray-900 font-medium text-sm">
										Settings
									</button>
								</div>
							</div>

							{/* History Table */}
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="text-left text-xs font-semibold text-gray-600 border-b">
											<th className="pb-3">Date</th>
											<th className="pb-3">Service</th>
											<th className="pb-3">Employee</th>
											<th className="pb-3">Source</th>
											<th className="pb-3 text-right">Paid</th>
											<th className="pb-3 text-right">Status</th>
										</tr>
									</thead>
									<tbody>
										{customerDetails.bookings && customerDetails.bookings.length > 0 ? (
											customerDetails.bookings.map((booking, index) => {
												const bookingDate = new Date(booking.date);
												const isPast = bookingDate < new Date();
												
												return (
													<tr key={booking._id || index} className="border-b hover:bg-gray-50">
														<td className="py-4">
															<div className="flex items-center gap-2">
																<Clock className="w-4 h-4 text-gray-400" />
																<div>
																	<div className="text-sm font-medium">
																		{bookingDate.toLocaleDateString('en-US', {
																			year: 'numeric',
																			month: '2-digit',
																			day: '2-digit'
																		})}
																	</div>
																	<div className="text-xs text-gray-500">
																		{booking.time || 'N/A'}
																	</div>
																</div>
															</div>
														</td>
														<td className="py-4">
															<div className="text-sm">
																{booking.serviceName || booking.service?.name || 'Service'}
															</div>
														</td>
														<td className="py-4">
															<div className="text-sm">
																{booking.barber?.name || 'N/A'}
															</div>
														</td>
														<td className="py-4">
															<span className={`inline-block px-2 py-1 text-xs rounded font-medium ${
																booking.source === 'Website' ? 'bg-blue-500 text-white' :
																booking.source === 'Treatwell' ? 'bg-green-500 text-white' :
																booking.source === 'Walk-in' ? 'bg-purple-500 text-white' :
																booking.source === 'Phone' ? 'bg-orange-500 text-white' :
																'bg-gray-500 text-white'
															}`}>
																{booking.source || 'Website'}
															</span>
														</td>
														<td className="py-4 text-right">
															<div className="text-sm font-semibold">
																${booking.price || '0.00'}
															</div>
														</td>
														<td className="py-4 text-right">
															{isPast && booking.status === 'confirmed' ? (
																<span className="inline-block px-2 py-1 bg-green-500 text-white text-xs rounded font-semibold">
																	DONE
																</span>
															) : booking.status === 'cancelled' ? (
																<div>
																	<span className="inline-block px-2 py-1 bg-red-500 text-white text-xs rounded font-semibold mb-1">
																		THE CUSTOMER DID NOT ARRIVE
																	</span>
																	<div className="text-xs text-red-600 font-semibold">
																		UNPAID
																	</div>
																</div>
															) : (
																<span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${
																	booking.status === 'confirmed' ? 'bg-blue-500 text-white' :
																	booking.status === 'pending' ? 'bg-yellow-500 text-white' :
																	'bg-gray-500 text-white'
																}`}>
																	{booking.status.toUpperCase()}
																</span>
															)}
														</td>
													</tr>
												);
											})
										) : (
											<tr>
												<td colSpan="6" className="py-8 text-center text-gray-500">
													No booking history found
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Add Comment Modal */}
			{showCommentModal && selectedBooking && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[300] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
						{/* Header */}
						<div className="px-6 py-4 border-b flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-700">Add Comment</h2>
							<button 
								onClick={() => {
									setShowCommentModal(false);
									setCommentText('');
								}}
								className="text-gray-500 hover:text-gray-700 transition"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Comment
								</label>
								<textarea
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									rows="4"
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									placeholder="Enter your comment here..."
									autoFocus
								/>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<button 
									onClick={() => {
										setShowCommentModal(false);
										setCommentText('');
									}}
									className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
								>
									Cancel
								</button>
								<button 
									onClick={async () => {
										if (!commentText.trim()) {
											alert('Please enter a comment');
											return;
										}
										try {
											const response = await bookingsAPI.addComment(selectedBooking._id, commentText);
											// Update the selected booking with new comment
											setSelectedBooking(response.data);
											// Refresh bookings list
											await fetchBookings();
											setCommentText('');
											setShowCommentModal(false);
											alert('✅ Comment added successfully!');
										} catch (error) {
											console.error('Error adding comment:', error);
											alert('❌ Failed to add comment');
										}
									}}
									className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
								>
									Add Comment
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Repeat Booking Modal */}
			{showRepeatModal && selectedBooking && (
				<div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[300] p-4">
					<div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
						{/* Header */}
						<div className="px-6 py-4 border-b flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-gray-700">Repeat Booking</h2>
								<p className="text-sm text-gray-500">Book same service for this customer</p>
							</div>
							<button 
								onClick={() => setShowRepeatModal(false)}
								className="text-gray-500 hover:text-gray-700 transition"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6">
							{/* Customer & Service Info Display */}
							<div className="mb-6 space-y-3">
								<div className="p-4 bg-blue-50 rounded-lg">
									<p className="text-xs text-gray-600 mb-1">CUSTOMER</p>
									<p className="font-semibold text-gray-800">{selectedBooking.customerInfo?.name || selectedBooking.user?.name}</p>
									<p className="text-sm text-gray-600">{selectedBooking.customerInfo?.phone || selectedBooking.user?.phone}</p>
								</div>
								
								<div className="p-4 bg-green-50 rounded-lg">
									<p className="text-xs text-gray-600 mb-1">SERVICE & TIME</p>
									<p className="font-semibold text-gray-800">{selectedBooking.serviceName || selectedBooking.service?.name}</p>
									<p className="text-sm text-gray-600">Time: {selectedBooking.time}</p>
									<p className="text-sm text-gray-600">Barber: {selectedBooking.barber?.name || 'Any Available'}</p>
								</div>
							</div>

							{/* Quick Repeat Options */}
							<div className="space-y-3">
								<p className="text-sm font-medium text-gray-700 mb-3">When should we book the next appointment?</p>
								
								{/* Quick buttons */}
								<button
									onClick={() => handleQuickRepeat(1)}
									className="w-full p-4 border-2 border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left"
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-semibold text-gray-800">Next Week</p>
											<p className="text-sm text-gray-600">{new Date(new Date(selectedBooking.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} at {selectedBooking.time}</p>
										</div>
										<Repeat className="w-5 h-5 text-blue-600" />
									</div>
								</button>

								<button
									onClick={() => handleQuickRepeat(2)}
									className="w-full p-4 border-2 border-green-300 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-semibold text-gray-800">In 2 Weeks</p>
											<p className="text-sm text-gray-600">{new Date(new Date(selectedBooking.date).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()} at {selectedBooking.time}</p>
										</div>
										<Repeat className="w-5 h-5 text-green-600" />
									</div>
								</button>

								<button
									onClick={() => handleQuickRepeat(4)}
									className="w-full p-4 border-2 border-purple-300 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left"
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-semibold text-gray-800">In 4 Weeks (1 Month)</p>
											<p className="text-sm text-gray-600">{new Date(new Date(selectedBooking.date).getTime() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString()} at {selectedBooking.time}</p>
										</div>
										<Repeat className="w-5 h-5 text-purple-600" />
									</div>
								</button>

								{/* Custom Date Option */}
								<div className="pt-4 border-t">
									<p className="text-sm font-medium text-gray-700 mb-3">Or pick a custom date:</p>
									<div className="flex gap-2">
										<input
											type="date"
											value={repeatBookingData.date}
											onChange={(e) => setRepeatBookingData({ ...repeatBookingData, date: e.target.value })}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
										/>
										<input
											type="time"
											value={repeatBookingData.time}
											onChange={(e) => setRepeatBookingData({ ...repeatBookingData, time: e.target.value })}
											className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
										/>
									</div>
									<button
										onClick={handleSubmitRepeatBooking}
										className="w-full mt-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
									>
										Book Custom Date
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
			</div>
		</AdminLayout>
	);
};

export default AdminCalendar;