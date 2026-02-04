import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('token'));
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser && token) {
			setUser(JSON.parse(storedUser));
		}
		setLoading(false);
	}, [token]);

	const login = async (credentials) => {
		try {
			const response = await authAPI.login(credentials);
			const { token, user } = response.data;
      
			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(user));
      
			setToken(token);
			setUser(user);
      
			return { success: true };
		} catch (error) {
			return { 
				success: false, 
				message: error.response?.data?.message || 'Login failed' 
			};
		}
	};

	const register = async (userData) => {
		try {
			const response = await authAPI.register(userData);
			const { token, user } = response.data;
      
			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(user));
      
			setToken(token);
			setUser(user);
      
			return { success: true };
		} catch (error) {
			return { 
				success: false, 
				message: error.response?.data?.message || 'Registration failed' 
			};
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setToken(null);
		setUser(null);
	};

	const isAuthenticated = () => !!token && !!user;
  
	const isAdmin = () => user?.role === 'owner' || user?.role === 'admin';
	
	// Staff includes admin, owner, and receptionist (NOT customers)
	const isStaff = () => user?.role === 'owner' || user?.role === 'admin' || user?.role === 'receptionist';

	return (
		<AuthContext.Provider 
			value={{ 
				user, 
				token, 
				login, 
				register, 
				logout, 
				isAuthenticated,
				isAdmin,
				isStaff,
				loading 
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

