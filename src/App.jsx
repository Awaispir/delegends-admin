import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import AdminCalendar from './pages/AdminCalendar';
import AdminOverview from './pages/AdminOverview';
import AdminMenu from './pages/AdminMenu';
import AdminTeam from './pages/AdminTeam';
import AdminCustomers from './pages/AdminCustomers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminMarketing from './pages/AdminMarketing';
import AdminReports from './pages/AdminReports';
import AdminReviews from './pages/AdminReviews';
import AdminJobs from './pages/AdminJobs';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					<Route path="/auth/login" element={<Login />} />
					<Route path="/auth/register" element={<Register />} />

					<Route
						path="/admin/calendar"
						element={
							<ProtectedRoute staffOnly>
								<AdminCalendar />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/overview"
						element={
							<ProtectedRoute adminOnly>
								<AdminOverview />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/menu"
						element={
							<ProtectedRoute adminOnly>
								<AdminMenu />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/team"
						element={
							<ProtectedRoute adminOnly>
								<AdminTeam />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/customers"
						element={
							<ProtectedRoute staffOnly>
								<AdminCustomers />
							</ProtectedRoute>
						}
					/>

					<Route
						path="/admin/products"
						element={
							<ProtectedRoute adminOnly>
								<AdminProducts />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/admin/orders"
						element={
							<ProtectedRoute adminOnly>
								<AdminOrders />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/admin/orders/:id"
						element={
							<ProtectedRoute adminOnly>
								<AdminOrderDetail />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/admin/marketing"
						element={
							<ProtectedRoute adminOnly>
								<AdminMarketing />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/admin/reports"
						element={
							<ProtectedRoute adminOnly>
								<AdminReports />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/admin/reviews"
						element={
							<ProtectedRoute adminOnly>
								<AdminReviews />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/admin/jobs"
						element={
							<ProtectedRoute adminOnly>
								<AdminJobs />
							</ProtectedRoute>
						}
					/>

					<Route path="/" element={<Navigate to="/admin/overview" replace />} />
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;

