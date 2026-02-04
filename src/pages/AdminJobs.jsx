import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Plus, Edit, Trash2, Eye, MapPin, Calendar, Users } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminJobs = () => {
	const [jobs, setJobs] = useState([]);
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'
	const [showJobModal, setShowJobModal] = useState(false);
	const [editingJob, setEditingJob] = useState(null);
	const [selectedJob, setSelectedJob] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		location: 'OLDTOWN',
		address: '',
		jobType: 'full-time',
		description: '',
		requirements: [''],
		benefits: [''],
		status: 'active'
	});

	useEffect(() => {
		fetchJobs();
		fetchApplications();
	}, []);

	const fetchJobs = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await axios.get(`${API_URL}/jobs/admin/all`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setJobs(response.data);
		} catch (error) {
			console.error('Error fetching jobs:', error);
			Swal.fire('Error', 'Failed to fetch job postings', 'error');
		} finally {
			setLoading(false);
		}
	};

	const fetchApplications = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(`${API_URL}/jobs/admin/applications/all`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setApplications(response.data);
		} catch (error) {
			console.error('Error fetching applications:', error);
		}
	};

	const handleSaveJob = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem('token');
			const jobData = {
				...formData,
				requirements: formData.requirements.filter(r => r.trim() !== ''),
				benefits: formData.benefits.filter(b => b.trim() !== '')
			};

			if (editingJob) {
				await axios.put(`${API_URL}/jobs/admin/${editingJob._id}`, jobData, {
					headers: { Authorization: `Bearer ${token}` }
				});
				Swal.fire('Updated!', 'Job posting updated successfully', 'success');
			} else {
				await axios.post(`${API_URL}/jobs/admin/create`, jobData, {
					headers: { Authorization: `Bearer ${token}` }
				});
				Swal.fire('Created!', 'Job posting created successfully', 'success');
			}

			setShowJobModal(false);
			setEditingJob(null);
			resetForm();
			fetchJobs();
		} catch (error) {
			console.error('Error saving job:', error);
			Swal.fire('Error', error.response?.data?.message || 'Failed to save job posting', 'error');
		}
	};

	const handleDeleteJob = async (jobId) => {
		const result = await Swal.fire({
			title: 'Delete Job Posting?',
			text: 'This will also delete all applications for this job!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Yes, delete it!'
		});

		if (result.isConfirmed) {
			try {
				const token = localStorage.getItem('token');
				await axios.delete(`${API_URL}/jobs/admin/${jobId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				Swal.fire('Deleted!', 'Job posting has been deleted', 'success');
				fetchJobs();
				fetchApplications();
			} catch (error) {
				console.error('Error deleting job:', error);
				Swal.fire('Error', 'Failed to delete job posting', 'error');
			}
		}
	};

	const handleEditJob = (job) => {
		setEditingJob(job);
		setFormData({
			title: job.title,
			location: job.location,
			address: job.address,
			jobType: job.jobType,
			description: job.description,
			requirements: job.requirements.length > 0 ? job.requirements : [''],
			benefits: job.benefits.length > 0 ? job.benefits : [''],
			status: job.status
		});
		setShowJobModal(true);
	};

	const handleViewApplications = async (job) => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get(`${API_URL}/jobs/admin/${job._id}/applications`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setSelectedJob({ ...job, applications: response.data });
		} catch (error) {
			console.error('Error fetching applications:', error);
			Swal.fire('Error', 'Failed to fetch applications', 'error');
		}
	};

	const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
		try {
			const token = localStorage.getItem('token');
			await axios.patch(`${API_URL}/jobs/admin/applications/${applicationId}/status`, 
				{ status: newStatus },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			Swal.fire('Updated!', `Application marked as ${newStatus}`, 'success');
			fetchApplications();
			if (selectedJob) {
				handleViewApplications(selectedJob);
			}
		} catch (error) {
			console.error('Error updating application:', error);
			Swal.fire('Error', 'Failed to update application', 'error');
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			location: 'OLDTOWN',
			address: '',
			jobType: 'full-time',
			description: '',
			requirements: [''],
			benefits: [''],
			status: 'active'
		});
	};

	const addArrayField = (field) => {
		setFormData({ ...formData, [field]: [...formData[field], ''] });
	};

	const removeArrayField = (field, index) => {
		const newArray = formData[field].filter((_, i) => i !== index);
		setFormData({ ...formData, [field]: newArray });
	};

	const updateArrayField = (field, index, value) => {
		const newArray = [...formData[field]];
		newArray[index] = value;
		setFormData({ ...formData, [field]: newArray });
	};

	return (
		<div className="p-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Career Management</h1>
					<p className="text-gray-600 mt-1">Manage job postings and applications</p>
				</div>
				<button
					onClick={() => {
						setEditingJob(null);
						resetForm();
						setShowJobModal(true);
					}}
					className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
				>
					<Plus className="w-5 h-5" />
					Post New Job
				</button>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200 mb-6">
				<button
					onClick={() => setActiveTab('jobs')}
					className={`px-6 py-3 font-semibold ${
						activeTab === 'jobs'
							? 'border-b-2 border-blue-600 text-blue-600'
							: 'text-gray-600 hover:text-gray-800'
					}`}
				>
					Job Postings ({jobs.length})
				</button>
				<button
					onClick={() => setActiveTab('applications')}
					className={`px-6 py-3 font-semibold ${
						activeTab === 'applications'
							? 'border-b-2 border-blue-600 text-blue-600'
							: 'text-gray-600 hover:text-gray-800'
					}`}
				>
					Applications ({applications.length})
				</button>
			</div>

			{/* Jobs Tab */}
			{activeTab === 'jobs' && (
				<div className="grid gap-4">
					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						</div>
					) : jobs.length === 0 ? (
						<div className="bg-white rounded-lg p-12 text-center">
							<Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">No job postings yet. Create your first job!</p>
						</div>
					) : (
						jobs.map((job) => (
							<div key={job._id} className="bg-white rounded-lg shadow-md p-6">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
											<span className={`px-3 py-1 rounded-full text-xs font-semibold ${
												job.status === 'active' ? 'bg-green-100 text-green-800' :
												job.status === 'closed' ? 'bg-red-100 text-red-800' :
												'bg-gray-100 text-gray-800'
											}`}>
												{job.status.toUpperCase()}
											</span>
											<span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
												{job.jobType}
											</span>
										</div>
										<div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
											<span className="flex items-center gap-1">
												<MapPin className="w-4 h-4" />
												{job.location}
											</span>
											<span className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												{new Date(job.postedDate).toLocaleDateString()}
											</span>
											<span className="flex items-center gap-1">
												<Users className="w-4 h-4" />
												{job.applicationCount || 0} applications
											</span>
										</div>
										<p className="text-gray-700 line-clamp-2">{job.description}</p>
									</div>
									<div className="flex gap-2 ml-4">
										<button
											onClick={() => handleViewApplications(job)}
											className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
											title="View Applications"
										>
											<Eye className="w-5 h-5" />
										</button>
										<button
											onClick={() => handleEditJob(job)}
											className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
											title="Edit"
										>
											<Edit className="w-5 h-5" />
										</button>
										<button
											onClick={() => handleDeleteJob(job._id)}
											className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
											title="Delete"
										>
											<Trash2 className="w-5 h-5" />
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			)}

			{/* Applications Tab */}
			{activeTab === 'applications' && (
				<div className="bg-white rounded-lg shadow-md overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50 border-b">
							<tr>
								<th className="text-left p-4 font-semibold text-gray-700">Applicant</th>
								<th className="text-left p-4 font-semibold text-gray-700">Job</th>
								<th className="text-left p-4 font-semibold text-gray-700">Applied Date</th>
								<th className="text-left p-4 font-semibold text-gray-700">Status</th>
								<th className="text-left p-4 font-semibold text-gray-700">Actions</th>
							</tr>
						</thead>
						<tbody>
							{applications.length === 0 ? (
								<tr>
									<td colSpan="5" className="text-center py-12 text-gray-500">
										No applications yet
									</td>
								</tr>
							) : (
								applications.map((app) => (
									<tr key={app._id} className="border-b hover:bg-gray-50">
										<td className="p-4">
											<div>
												<div className="font-semibold">{app.name}</div>
												<div className="text-sm text-gray-600">{app.email}</div>
												<div className="text-sm text-gray-600">{app.phone}</div>
											</div>
										</td>
										<td className="p-4">
											<div className="font-medium">{app.job?.title}</div>
											<div className="text-sm text-gray-600">{app.job?.location}</div>
										</td>
										<td className="p-4 text-sm text-gray-600">
											{new Date(app.appliedDate).toLocaleDateString()}
										</td>
										<td className="p-4">
											<select
												value={app.status}
												onChange={(e) => handleUpdateApplicationStatus(app._id, e.target.value)}
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
													app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
													app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
													app.status === 'rejected' ? 'bg-red-100 text-red-800' :
													'bg-purple-100 text-purple-800'
												}`}
											>
												<option value="pending">Pending</option>
												<option value="reviewed">Reviewed</option>
												<option value="shortlisted">Shortlisted</option>
												<option value="hired">Hired</option>
												<option value="rejected">Rejected</option>
											</select>
										</td>
										<td className="p-4">
											<button
												onClick={() => Swal.fire({
													title: app.name,
													html: `
														<div class="text-left">
															<p><strong>Email:</strong> ${app.email}</p>
															<p><strong>Phone:</strong> ${app.phone}</p>
															<p class="mt-4"><strong>Message:</strong></p>
															<p>${app.message}</p>
														</div>
													`,
													width: 600
												})}
												className="text-blue-600 hover:underline text-sm"
											>
												View Details
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}

			{/* Job Modal */}
			{showJobModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b">
							<h2 className="text-2xl font-bold">{editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}</h2>
						</div>
						<form onSubmit={handleSaveJob} className="p-6 space-y-6">
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold mb-2">Job Title *</label>
									<input
										type="text"
										required
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
										placeholder="e.g., Senior Barber"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold mb-2">Location *</label>
									<select
										required
										value={formData.location}
										onChange={(e) => setFormData({ ...formData, location: e.target.value })}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="OLDTOWN">OLDTOWN</option>
										<option value="BIG VILNIUS">BIG VILNIUS</option>
										<option value="Both Locations">Both Locations</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-2">Address *</label>
								<input
									type="text"
									required
									value={formData.address}
									onChange={(e) => setFormData({ ...formData, address: e.target.value })}
									className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="Pilies g. 38 Vilnius, LT-01123"
								/>
							</div>

							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold mb-2">Job Type *</label>
									<select
										required
										value={formData.jobType}
										onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="full-time">Full Time</option>
										<option value="part-time">Part Time</option>
										<option value="contract">Contract</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold mb-2">Status *</label>
									<select
										required
										value={formData.status}
										onChange={(e) => setFormData({ ...formData, status: e.target.value })}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
									>
										<option value="active">Active</option>
										<option value="draft">Draft</option>
										<option value="closed">Closed</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-2">Description *</label>
								<textarea
									required
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
									rows="4"
									placeholder="Job description..."
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-2">Requirements</label>
								{formData.requirements.map((req, index) => (
									<div key={index} className="flex gap-2 mb-2">
										<input
											type="text"
											value={req}
											onChange={(e) => updateArrayField('requirements', index, e.target.value)}
											className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
											placeholder="Requirement..."
										/>
										<button
											type="button"
											onClick={() => removeArrayField('requirements', index)}
											className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
										>
											Remove
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => addArrayField('requirements')}
									className="text-blue-600 hover:underline text-sm"
								>
									+ Add Requirement
								</button>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-2">Benefits</label>
								{formData.benefits.map((benefit, index) => (
									<div key={index} className="flex gap-2 mb-2">
										<input
											type="text"
											value={benefit}
											onChange={(e) => updateArrayField('benefits', index, e.target.value)}
											className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
											placeholder="Benefit..."
										/>
										<button
											type="button"
											onClick={() => removeArrayField('benefits', index)}
											className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
										>
											Remove
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => addArrayField('benefits')}
									className="text-blue-600 hover:underline text-sm"
								>
									+ Add Benefit
								</button>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={() => {
										setShowJobModal(false);
										setEditingJob(null);
										resetForm();
									}}
									className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
								>
									{editingJob ? 'Update Job' : 'Create Job'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* View Applications Modal */}
			{selectedJob && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-bold">{selectedJob.title}</h2>
								<p className="text-gray-600">{selectedJob.applications?.length || 0} Applications</p>
							</div>
							<button
								onClick={() => setSelectedJob(null)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>
						<div className="p-6">
							{selectedJob.applications?.length === 0 ? (
								<p className="text-center text-gray-500 py-8">No applications yet</p>
							) : (
								<div className="space-y-4">
									{selectedJob.applications?.map((app) => (
										<div key={app._id} className="border rounded-lg p-4">
											<div className="flex justify-between items-start mb-3">
												<div>
													<h4 className="font-bold text-lg">{app.name}</h4>
													<p className="text-sm text-gray-600">{app.email}</p>
													<p className="text-sm text-gray-600">{app.phone}</p>
												</div>
												<select
													value={app.status}
													onChange={(e) => handleUpdateApplicationStatus(app._id, e.target.value)}
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
														app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
														app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
														app.status === 'rejected' ? 'bg-red-100 text-red-800' :
														'bg-purple-100 text-purple-800'
													}`}
												>
													<option value="pending">Pending</option>
													<option value="reviewed">Reviewed</option>
													<option value="shortlisted">Shortlisted</option>
													<option value="hired">Hired</option>
													<option value="rejected">Rejected</option>
												</select>
											</div>
											<div>
												<p className="text-sm font-semibold text-gray-700 mb-1">Message:</p>
												<p className="text-sm text-gray-600">{app.message}</p>
											</div>
											<div className="mt-3 text-xs text-gray-500">
												Applied: {new Date(app.appliedDate).toLocaleDateString()}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminJobs;
