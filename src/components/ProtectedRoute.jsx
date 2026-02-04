import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
	const { isAuthenticated, isAdmin, isStaff, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-xl">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated()) {
		return <Navigate to="/auth/login" replace />;
	}

	// Admin only (owner + admin)
	if (adminOnly && !isAdmin()) {
		return <Navigate to="/" replace />;
	}
	
	// Staff only (owner + admin + receptionist)
	if (staffOnly && !isStaff()) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export default ProtectedRoute;

