import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		phone: '',
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const { register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess(false);
    
		const result = await register(formData);
		if (result.success) {
			setSuccess(true);
			setTimeout(() => {
				navigate('/admin/login');
			}, 1500);
		} else {
			setError(result.message);
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
					<p className="text-sm text-gray-600">Admin Registration</p>
				</div>

				{/* Form Container */}
				<div className="bg-white rounded-lg shadow-md p-8">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
							{error}
						</div>
					)}

					{success && (
						<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center">
							<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							Success! Redirecting to login...
						</div>
					)}
          
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
							<input
								type="text"
								required
								className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Enter your full name"
							/>
						</div>
            
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
							<input
								type="email"
								required
								className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="your@email.com"
							/>
						</div>
            
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
							<input
								type="tel"
								className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								placeholder="+44 123 456 7890"
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
								placeholder="Enter your password"
							/>
						</div>

						{/* Cloudflare-like Success Message */}
						{success && (
							<div className="flex items-center justify-center space-x-2 py-3 bg-gray-50 rounded-md">
								<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<span className="text-sm font-medium text-gray-700">Success!</span>
							</div>
						)}
            
						<button
							type="submit"
							className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition font-medium shadow-sm"
							disabled={success}
						>
							Sign up
						</button>
					</form>
				</div>

				{/* Already have account section */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600 mb-3">
						Already have an admin account?
					</p>
					<Link
						to="/admin/login"
						className="block w-full bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 transition font-medium shadow-sm"
					>
						Log in now
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Register;

