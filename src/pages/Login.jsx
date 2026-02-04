import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [keepLoggedIn, setKeepLoggedIn] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
		
		const result = await login(formData);
		if (result.success) {
			// Check if user is staff (admin, owner, receptionist) - NOT customers
			const user = JSON.parse(localStorage.getItem('user'));
			if (user?.role === 'admin' || user?.role === 'owner' || user?.role === 'receptionist') {
				setSuccess(true);
				
				// Different welcome messages
				const welcomeMessage = user.role === 'owner' ? 'Welcome Owner!' : 
									   user.role === 'admin' ? 'Welcome Admin!' : 
									   'Welcome to the Team!';
				
				Swal.fire({
					toast: true,
					position: 'top-end',
					icon: 'success',
					title: welcomeMessage,
					showConfirmButton: false,
					timer: 2000,
					timerProgressBar: true
				});
				
				setTimeout(() => {
					navigate('/admin/calendar');
				}, 800);
			} else {
				// Customer trying to access admin panel - logout and show error
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				const errorMsg = 'Access Denied: Staff credentials required. Customers cannot access admin panel.';
				setError(errorMsg);
				
				Swal.fire({
					toast: true,
					position: 'top-end',
					icon: 'error',
					title: 'Access Denied',
					text: 'Staff credentials required',
					showConfirmButton: false,
					timer: 3000,
					timerProgressBar: true
				});
			}
		} else {
			setError(result.message);
			
			Swal.fire({
				toast: true,
				position: 'top-end',
				icon: 'error',
				title: result.message || 'Login failed',
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true
			});
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
			<div className="max-w-md w-full">
				{/* Treatwell Connect Branding */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">
						<span style={{ color: '#4F46E5' }}>treatwell</span>{' '}
						<span style={{ color: '#6366F1' }}>connect</span>
					</h1>
					<p className="text-sm text-indigo-600 font-medium mt-1">Admin Dashboard</p>
				</div>

				{/* Form Container */}
				<div className="bg-white rounded-lg shadow-md p-8">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
							{error}
						</div>
					)}
					
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								required
								className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder=""
							/>
						</div>
						
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
							<input
								type="password"
								required
								className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
								value={formData.password}
								onChange={(e) => setFormData({ ...formData, password: e.target.value })}
								placeholder=""
							/>
						</div>

						{/* Success Message with Cloudflare Style */}
						{success && (
							<div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-md border border-gray-200">
								<div className="flex items-center space-x-2">
									<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
										<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<span className="text-sm font-medium text-gray-700">Success!</span>
								</div>
								<div className="flex items-center space-x-1">
									<svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 2L2 19h20L12 2z"/>
									</svg>
									<span className="text-xs font-semibold text-gray-700">CLOUDFLARE</span>
								</div>
							</div>
						)}

						{/* Keep me logged in & Reset password */}
						<div className="flex items-center justify-between">
							<label className="flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={keepLoggedIn}
									onChange={(e) => setKeepLoggedIn(e.target.checked)}
									className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
								/>
								<span className="ml-2 text-sm text-gray-600">Keep me logged in</span>
							</label>
							<Link to="/admin/reset-password" className="text-sm text-indigo-600 hover:text-indigo-700">
								Reset your password
							</Link>
						</div>
						
						<button
							type="submit"
							className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition font-medium shadow-sm"
							disabled={success}
						>
							Log in
						</button>
					</form>
				</div>

				{/* Admin Access Only - No signup */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						Admin Dashboard - Authorized Access Only
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;

