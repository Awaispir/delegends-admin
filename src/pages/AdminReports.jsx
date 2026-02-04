import AdminLayout from '../layouts/AdminLayout';
import { FileText, PieChart, BarChart3, LineChart, TrendingUp } from 'lucide-react';

const AdminReports = () => {
	return (
		<AdminLayout>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
				<div className="max-w-2xl w-full">
					<div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
						{/* Icon Container */}
						<div className="flex justify-center mb-8">
							<div className="relative">
								<div className="absolute inset-0 bg-blue-400 blur-2xl opacity-30 animate-pulse"></div>
								<div className="relative bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full p-6">
									<FileText className="w-16 h-16 text-white" />
								</div>
							</div>
						</div>

						{/* Title */}
						<h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
							Reports
						</h1>
						
						{/* Subtitle */}
						<p className="text-2xl text-gray-600 mb-8">
							Coming Soon
						</p>

						{/* Description */}
						<p className="text-gray-500 mb-12 max-w-lg mx-auto">
							Advanced reporting and analytics features are on the way. Get ready to make data-driven decisions!
						</p>

						{/* Feature Icons */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
							<div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl">
								<BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
								<span className="text-xs text-gray-600">Sales Reports</span>
							</div>
							<div className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl">
								<PieChart className="w-8 h-8 text-indigo-600 mb-2" />
								<span className="text-xs text-gray-600">Revenue Analysis</span>
							</div>
							<div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl">
								<LineChart className="w-8 h-8 text-purple-600 mb-2" />
								<span className="text-xs text-gray-600">Trends</span>
							</div>
							<div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl">
								<TrendingUp className="w-8 h-8 text-pink-600 mb-2" />
								<span className="text-xs text-gray-600">Performance</span>
							</div>
						</div>

						{/* Status Badge */}
						<div className="inline-block">
							<span className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-semibold shadow-lg">
								📊 In Development
							</span>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminReports;
