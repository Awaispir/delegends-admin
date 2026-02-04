import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});


api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Auth API
export const authAPI = {
	login: (credentials) => api.post('/auth/login', credentials),
	register: (userData) => api.post('/auth/register', userData),
	updateUser: (id, userData) => api.put(`/auth/user/${id}`, userData),
	createEmployee: (employeeData) => api.post('/auth/create-employee', employeeData),
	updateUserByEmail: (email, data) => api.put(`/auth/user-by-email/${email}`, data),
};

// Salons API
export const salonsAPI = {
	getAll: () => api.get('/salons'),
	getOne: (id) => api.get(`/salons/${id}`),
	create: (salonData) => api.post('/salons', salonData),
	update: (id, salonData) => api.put(`/salons/${id}`, salonData),
	delete: (id) => api.delete(`/salons/${id}`),
};

// Bookings API
export const bookingsAPI = {
	getAll: () => api.get('/bookings'),
	getAllBookings: () => api.get('/bookings/all'),
	// Get all bookings including guest bookings
	getAllWithGuests: () => api.get('/admin/bookings/all-with-guests'),
	create: (bookingData) => api.post('/bookings', bookingData),
	update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
	updateStatus: (id, status) => api.patch(`/bookings/${id}`, { status }),
	delete: (id) => api.delete(`/bookings/${id}`),
	getStats: () => api.get('/bookings/stats/dashboard'),
	addComment: (id, text) => api.post(`/bookings/${id}/comments`, { text }),
};

// Barbers API
export const barbersAPI = {
	getAll: () => api.get('/barbers'),
	getAllBarbers: () => api.get('/barbers/all'),
	create: (barberData) => api.post('/barbers', barberData),
	update: (id, barberData) => api.put(`/barbers/${id}`, barberData),
	updateSchedule: (id, scheduleData) => api.put(`/barbers/${id}/schedule`, scheduleData),
	updateWeeklySchedule: (id, weekSchedule) => api.put(`/barbers/${id}/weekly-schedule`, { weekSchedule }),
	delete: (id) => api.delete(`/barbers/${id}`),
	uploadImage: (formData) => {
		return api.post('/barbers/upload-image', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	},
};

// Services API
export const servicesAPI = {
	getAll: () => api.get('/services'),
	getAllServices: () => api.get('/services/all'),
	create: (serviceData) => api.post('/services', serviceData),
	update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
	delete: (id) => api.delete(`/services/${id}`),
};

// Customers API
export const customersAPI = {
	getAll: () => api.get('/customers'),
	getOne: (id) => api.get(`/customers/${id}`),
	getByEmail: (email) => api.get(`/customers/by-email/${encodeURIComponent(email)}`),
	update: (id, customerData) => api.put(`/customers/${id}`, customerData),
	delete: (id) => api.delete(`/customers/${id}`),
};

// Products API
export const productsAPI = {
	getAll: () => api.get('/products'),
	getAllProducts: () => api.get('/products/all'),
	getOne: (id) => api.get(`/products/${id}`),
	create: (productData) => api.post('/products', productData),
	update: (id, productData) => api.put(`/products/${id}`, productData),
	delete: (id) => api.delete(`/products/${id}`),
	uploadImage: (formData) => {
		return api.post('/products/upload-image', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	},
};

// Reviews API
export const reviewsAPI = {
	getAll: () => api.get('/reviews/all'),
	getApproved: () => api.get('/reviews/approved'),
	updateStatus: (id, status) => api.patch(`/reviews/${id}/status`, { status }),
	delete: (id) => api.delete(`/reviews/${id}`),
};

export default api;
