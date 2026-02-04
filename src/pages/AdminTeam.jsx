import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { barbersAPI, servicesAPI, authAPI } from '../utils/api';
import { Plus, Edit2, Trash2, User, Mail, Phone as PhoneIcon, CheckCircle, XCircle, Clock, Calendar, ChevronLeft, ChevronRight, Save, X as CloseIcon, Check, X as XIcon, MoreHorizontal, Upload, Image as ImageIcon } from 'lucide-react';

const AdminTeam = () => {
	const [barbers, setBarbers] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [editingBarber, setEditingBarber] = useState(null);
	const [activeTab, setActiveTab] = useState('schedule'); 
	const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
	const [showScheduleModal, setShowScheduleModal] = useState(false);
	const [selectedBarber, setSelectedBarber] = useState(null);
	const [weekScheduleData, setWeekScheduleData] = useState([]);
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);
	const [employeeModalTab, setEmployeeModalTab] = useState('basic');
	const [employeeFormData, setEmployeeFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		providesServices: true,
		employmentStatus: 'employee',
		rights: 'calendar-viewing',
		profession: '',
		description: ''
	});
	const [allServices, setAllServices] = useState([]);
	const [selectedServices, setSelectedServices] = useState([]);
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		specialties: '',
	});

	
	function getWeekStart(date) {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
		d.setDate(diff);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	function getWeekDates(weekStart) {
		const dates = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(weekStart);
			date.setDate(weekStart.getDate() + i);
			dates.push(date);
		}
		return dates;
	}

	const weekDates = getWeekDates(currentWeekStart);
	const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	const previousWeek = () => {
		const newDate = new Date(currentWeekStart);
		newDate.setDate(newDate.getDate() - 7);
		setCurrentWeekStart(newDate);
	};

	const nextWeek = () => {
		const newDate = new Date(currentWeekStart);
		newDate.setDate(newDate.getDate() + 7);
		setCurrentWeekStart(newDate);
	};

	useEffect(() => {
		fetchBarbers();
		fetchServices();
	}, []);

	const fetchServices = async () => {
		try {
			const response = await servicesAPI.getAllServices();
			setAllServices(response.data);
		} catch (error) {
			console.error('Error fetching services:', error);
		}
	};

	const fetchBarbers = async () => {
		try {
			const response = await barbersAPI.getAllBarbers();
			setBarbers(response.data);
		} catch (error) {
			console.error('Error fetching barbers:', error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const barberData = {
				...formData,
				specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
			};

			if (editingBarber) {
				await barbersAPI.update(editingBarber._id, barberData);
			} else {
				await barbersAPI.create(barberData);
			}

			fetchBarbers();
			setShowModal(false);
			setEditingBarber(null);
			setFormData({ name: '', email: '', phone: '', specialties: '' });
		} catch (error) {
			console.error('Error saving barber:', error);
			alert(error.response?.data?.message || 'Failed to save barber');
		}
	};

	const handleEdit = (barber) => {
		setSelectedBarber(barber);
		setEmployeeFormData({
			name: barber.name,
			email: barber.email,
			phone: barber.phone || '',
			password: '',
			providesServices: barber.isActive || true,
			employmentStatus: 'employee',
			rights: barber.role === 'owner' ? 'owner' : 
					barber.role === 'admin' ? 'administrator' : 
					barber.role === 'receptionist' ? 'calendar-viewing' : 'calendar-viewing',
			profession: barber.profession || '',
			description: barber.description || ''
		});

		setSelectedServices(barber.services || []);
		// Set image preview if barber has profileImage
		if (barber.profileImage) {
			setImagePreview(barber.profileImage);
		}
		setEmployeeModalTab('basic');
		setShowEmployeeModal(true);
	};

	const handleCreateEmployee = () => {
		setSelectedBarber(null);
		setEmployeeFormData({
			name: '',
			email: '',
			phone: '',
			password: '',
			providesServices: true,
			employmentStatus: 'employee',
			rights: 'calendar-viewing'
		});
		setSelectedServices([]);
		setImageFile(null);
		setImagePreview(null);
		setEmployeeModalTab('basic');
		setShowEmployeeModal(true);
	};

	const handleDelete = async (id) => {
		if (!confirm('Are you sure you want to delete this barber? This action cannot be undone.')) return;
		try {
			await barbersAPI.delete(id);
			fetchBarbers();
			// Close modal if it's open
			setShowEmployeeModal(false);
			setSelectedBarber(null);
			setSelectedServices([]);
			setImageFile(null);
			setImagePreview(null);
			alert('Team member deleted successfully!');
		} catch (error) {
			console.error('Error deleting barber:', error);
			alert('Failed to delete barber');
		}
	};

	const toggleActive = async (barber) => {
		try {
			await barbersAPI.update(barber._id, { ...barber, isActive: !barber.isActive });
			fetchBarbers();
		} catch (error) {
			console.error('Error updating barber:', error);
		}
	};

	const handleEditSchedule = (barber) => {
		setSelectedBarber(barber);

		const weekSchedule = weekDates.map((date, index) => {
			const dateStr = date.toISOString().split('T')[0];
			const dayKey = dayNames[index].toLowerCase();
			
			const override = barber.scheduleOverrides?.find(o => o.date === dateStr);
			
			if (override) {
				return {
					date: dateStr,
					isWorking: override.isWorking,
					startTime: override.startTime,
					endTime: override.endTime,
				};
			} else {
				const defaultSchedule = barber.schedule?.[dayKey] || { isWorking: true, startTime: '10:00', endTime: '20:00' };
				return {
					date: dateStr,
					isWorking: defaultSchedule.isWorking,
					startTime: defaultSchedule.startTime,
					endTime: defaultSchedule.endTime,
				};
			}
		});
		
		setWeekScheduleData(weekSchedule);
		setShowScheduleModal(true);
	};

	const handleSaveSchedule = async () => {
		try {
			await barbersAPI.updateWeeklySchedule(selectedBarber._id, weekScheduleData);
			fetchBarbers();
			setShowScheduleModal(false);
			setSelectedBarber(null);
			setWeekScheduleData([]);
		} catch (error) {
			console.error('Error updating schedule:', error);
			alert('Failed to update schedule');
		}
	};

	const handleCancelScheduleEdit = () => {
		setShowScheduleModal(false);
		setSelectedBarber(null);
		setWeekScheduleData([]);
	};

	const updateWeekScheduleDay = (index, field, value) => {
		const updatedSchedule = [...weekScheduleData];
		updatedSchedule[index] = {
			...updatedSchedule[index],
			[field]: value,
		};
		setWeekScheduleData(updatedSchedule);
	};

	const handleSaveEmployee = async () => {
		try {
			// Validation for new employee
			if (!selectedBarber) {
				if (!employeeFormData.name || !employeeFormData.email) {
					alert('Please fill in all required fields (Name and Email)');
					return;
				}
				if (!employeeFormData.password) {
					alert('Password is required for new employees');
					return;
				}
			}

			let profileImageUrl = selectedBarber?.profileImage || null;

			// Upload image first if a new file is selected
			if (imageFile) {
				console.log('Uploading barber image...');
				setUploading(true);
				const uploadFormData = new FormData();
				uploadFormData.append('image', imageFile);
				
				try {
					const uploadResponse = await barbersAPI.uploadImage(uploadFormData);
					console.log('Upload response:', uploadResponse.data);
					profileImageUrl = uploadResponse.data.imageUrl;
					setUploading(false);
				} catch (uploadError) {
					console.error('Image upload failed:', uploadError);
					const errorMsg = uploadError.response?.data?.message || uploadError.message || 'Image upload failed';
					alert('Image upload failed: ' + errorMsg);
					setUploading(false);
					return;
				}
			}

			// Map rights to role
			const rightsToRoleMap = {
				'calendar-viewing': 'receptionist',
				'calendar-management': 'receptionist',
				'administrator': 'admin',
				'owner': 'owner'
			};

			const userRole = rightsToRoleMap[employeeFormData.rights] || 'receptionist';

		const barberData = {
			name: employeeFormData.name,
			email: employeeFormData.email,
			phone: employeeFormData.phone,
			isActive: employeeFormData.providesServices,
			services: selectedServices,
			profileImage: profileImageUrl,
			role: userRole, // Save role in barber model
			profession: employeeFormData.profession || '',
			description: employeeFormData.description || ''
		};

			if (selectedBarber) {
				// Update existing barber
				await barbersAPI.update(selectedBarber._id, barberData);
				
				// Also update the user account role if email exists
				try {
					// Find user by email and update role
					const userResponse = await authAPI.updateUserByEmail(employeeFormData.email, {
						role: userRole
					});
					console.log('✅ User role updated:', userResponse.data);
				} catch (updateError) {
					console.warn('⚠️ Could not update user role:', updateError.message);
					// Don't fail the whole operation if user update fails
				}
				
				alert('✅ Employee updated successfully!');
			} else {
				// Create new barber AND user account
				try {
					// First create the user account with role
					const userResponse = await authAPI.createEmployee({
						name: employeeFormData.name,
						email: employeeFormData.email,
						password: employeeFormData.password,
						phone: employeeFormData.phone,
						role: userRole
					});

					console.log('✅ User account created:', userResponse.data);

					// Then create the barber profile
					await barbersAPI.create(barberData);

					alert(`✅ Employee created successfully!

Login Details:
Email: ${employeeFormData.email}
Password: ${employeeFormData.password}
Role: ${userRole.toUpperCase()}`);
				} catch (createError) {
					console.error('Error creating employee:', createError);
					const errorMsg = createError.response?.data?.message || createError.message;
					alert('❌ Failed to create employee: ' + errorMsg);
					return;
				}
			}

			await fetchBarbers();
			setShowEmployeeModal(false);
			setSelectedBarber(null);
			setSelectedServices([]);
			setImageFile(null);
			setImagePreview(null);
		} catch (error) {
			console.error('Error saving employee:', error);
			alert('Failed to save employee');
		}
	};

	// Group services by category
	const groupServicesByCategory = () => {
		const grouped = {};
		allServices.forEach(service => {
			const category = service.category || 'Uncategorized';
			if (!grouped[category]) {
				grouped[category] = [];
			}
			grouped[category].push(service);
		});
		return grouped;
	};


	const isAllServicesSelected = () => {
		return allServices.length > 0 && selectedServices.length === allServices.length;
	};

	// Check if all services in a category are selected
	const isCategorySelected = (categoryServices) => {
		return categoryServices.every(service => 
			selectedServices.includes(service._id)
		);
	};

	// Toggle all services
	const toggleAllServices = () => {
		if (isAllServicesSelected()) {
			setSelectedServices([]);
		} else {
			setSelectedServices(allServices.map(s => s._id));
		}
	};

	// Toggle category
	const toggleCategory = (categoryServices) => {
		const categoryIds = categoryServices.map(s => s._id);
		if (isCategorySelected(categoryServices)) {
			// Deselect all in category
			setSelectedServices(prev => prev.filter(id => !categoryIds.includes(id)));
		} else {
			// Select all in category
			setSelectedServices(prev => {
				const newSelected = [...prev];
				categoryIds.forEach(id => {
					if (!newSelected.includes(id)) {
						newSelected.push(id);
					}
				});
				return newSelected;
			});
		}
	};

	const toggleService = (serviceId) => {
		setSelectedServices(prev => {
			if (prev.includes(serviceId)) {
				return prev.filter(id => id !== serviceId);
			} else {
				return [...prev, serviceId];
			}
		});
	};

	const getScheduleForDate = (barber, date) => {
		const dateStr = date.toISOString().split('T')[0];
		const dayKey = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1].toLowerCase();
		
		
		const override = barber.scheduleOverrides?.find(o => o.date === dateStr);
		if (override) {
			return override;
		}
		
		
		return barber.schedule?.[dayKey] || { isWorking: true, startTime: '10:00', endTime: '20:00' };
	};

	// Handle image file selection
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				alert('Please select a valid image file');
				return;
			}
			// Validate file size (5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert('Image size should be less than 5MB');
				return;
			}
			setImageFile(file);
			// Create preview URL
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

		return (
			<AdminLayout>
				<div className="flex h-full bg-gray-50">
					{/* Sidebar - Fixed, No Scroll */}
					<div className="w-64 bg-white border-r flex-shrink-0 flex flex-col">
						{/* Top Buttons - Scrollable if needed */}
						<div className="p-4 space-y-1 flex-1 overflow-y-auto">
						
						<button
							onClick={() => setActiveTab('schedule')}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
								activeTab === 'schedule'
									? 'bg-gray-100 text-gray-900'
									: 'text-gray-600 hover:bg-gray-50'
							}`}
						>
							<Clock className="w-5 h-5" />
							<span>Work schedule</span>
						</button>

						{/* Employees Tab */}
						<button
							onClick={() => setActiveTab('employees')}
							className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
								activeTab === 'employees'
									? 'bg-gray-100 text-gray-900'
									: 'text-gray-600 hover:bg-gray-50'
							}`}
						>
							<User className="w-5 h-5" />
							<span>Employees</span>
						</button>
					</div>

					{/* Bottom Section - Fixed at Bottom */}
					<div className="border-t p-4 space-y-1 flex-shrink-0">
						<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<span>Recommend a salon</span>
						</button>
						<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" strokeWidth="2"/>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
							</svg>
							<span>Help articles</span>
						</button>
						<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							<span>What's new</span>
						</button>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="flex-1 overflow-auto">
					{activeTab === 'schedule' ? (
						/* Work Schedule View */
						<div className="p-8">
							<div className="mb-6">
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Work schedule</h1>
								
								{/* Week Navigation */}
								<div className="flex items-center gap-4 mt-4">
									<div className="flex items-center gap-2">
										<span className="text-sm text-gray-600">
											{weekDates[0].toLocaleDateString('en-CA')} - {weekDates[6].toLocaleDateString('en-CA')}
										</span>
									</div>
									<div className="flex gap-2">
										<button
											onClick={previousWeek}
											className="p-2 border rounded-lg hover:bg-gray-50"
										>
											<ChevronLeft className="w-5 h-5" />
										</button>
										<button
											onClick={nextWeek}
											className="p-2 border rounded-lg hover:bg-gray-50"
										>
											<ChevronRight className="w-5 h-5" />
										</button>
									</div>
								</div>
							</div>

							{/* Schedule Table */}
							<div className="bg-white rounded-lg shadow-sm overflow-hidden">
								<table className="w-full border-collapse">
									<thead>
										<tr className="bg-gray-50 border-b">
											<th className="text-left p-4 text-sm font-semibold text-gray-700 w-48"></th>
											{dayNames.map((day, index) => {
												const date = weekDates[index];
												const isToday = date.toDateString() === new Date().toDateString();
												return (
													<th key={day} className="p-4 text-center border-l">
														<div className={`text-sm font-semibold ${
															isToday ? 'text-indigo-600' : 'text-gray-700'
														}`}>
															{day}
														</div>
														<div className={`text-xs mt-1 ${
															isToday ? 'text-indigo-600 font-semibold' : 'text-gray-500'
														}`}>
															{date.getDate()}.{date.getMonth() + 1}
															{isToday && <span className="ml-1">(Today)</span>}
														</div>
													</th>
												);
											})}
										</tr>
									</thead>
									<tbody>
										{/* Salon opening hours row */}
										<tr className="border-b bg-blue-50">
											<td className="p-4">
												<div className="font-semibold text-sm text-gray-900">Salon opening hours</div>
											</td>
											{dayNames.map((day) => (
												<td key={`salon-${day}`} className="p-4 text-center border-l bg-blue-50">
													<div className="text-sm text-gray-700">10:00 - 20:00</div>
												</td>
											))}
										</tr>

										{/* Team members rows */}
										{barbers.map((barber, barberIndex) => {
											const bgColor = barberIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';
											return (
												<tr 
													key={barber._id} 
													className={`border-b hover:bg-indigo-50 cursor-pointer transition ${bgColor}`}
													onClick={() => handleEditSchedule(barber)}
												>
													<td className="p-4">
														<div className="flex items-center gap-3">
															{barber.profileImage ? (
																<img 
																	src={barber.profileImage} 
																	alt={barber.name}
																	className="w-10 h-10 rounded-full object-cover"
																/>
															) : (
																<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
																	{barber.name.charAt(0).toUpperCase()}
																</div>
															)}
															<div>
																<div className="font-semibold text-sm text-gray-900">{barber.name}</div>
																<div className="text-xs text-gray-500">{barber.weeklyHours || 70} hours/week</div>
															</div>
														</div>
													</td>
													{weekDates.map((date, dayIndex) => {
														const schedule = getScheduleForDate(barber, date);
														const isWorking = schedule?.isWorking !== false;
														const startTime = schedule?.startTime || '10:00';
														const endTime = schedule?.endTime || '20:00';
														
														return (
															<td key={`${barber._id}-${dayIndex}`} className={`p-4 text-center border-l ${bgColor}`}>
																{isWorking ? (
																	<div className="text-sm text-gray-700">
																		{startTime} - {endTime}
																	</div>
																) : (
																	<div className="text-sm text-gray-400">Off</div>
																)}
															</td>
														);
													})}
												</tr>
											);
										})}
									</tbody>
								</table>

								{barbers.length === 0 && (
									<div className="p-12 text-center">
										<User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
										<h3 className="text-lg font-semibold text-gray-700 mb-2">No Team Members Yet</h3>
										<p className="text-gray-500 mb-6">Add your first barber to see their schedule</p>
										<button
											onClick={() => setActiveTab('employees')}
											className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
										>
											Go to Employees
										</button>
									</div>
								)}
							</div>
						</div>
					) : (
						/* Employees View */
						<div className="p-8">
							<div className="flex justify-between items-center mb-6">
								<div className="relative">
									<select className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
										<option>Active</option>
										<option>Inactive</option>
										<option>All</option>
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
										<ChevronRight className="h-4 w-4 rotate-90" />
									</div>
								</div>
								<button
									onClick={handleCreateEmployee}
									className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium text-sm"
								>
									Create an employee
								</button>
							</div>

							{/* Employee List */}
							{barbers.length > 0 ? (
								<div className="bg-white rounded-lg shadow-sm overflow-hidden">
									<div className="divide-y divide-gray-100">
										{barbers.map((barber) => (
											<div 
												key={barber._id} 
												className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 cursor-pointer transition group"
												onClick={() => handleEdit(barber)}
											>
												{/* Left Side - Profile & Info */}
												<div className="flex items-center gap-4">
													{/* Profile Image */}
													{barber.profileImage ? (
														<img 
															src={barber.profileImage} 
															alt={barber.name}
															className="w-16 h-16 rounded object-cover"
														/>
													) : (
														<div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
															<User className="w-8 h-8 text-gray-400" />
														</div>
													)}

													{/* Name & Badges */}
													<div className="flex flex-col gap-2">
														<h3 className="text-base font-semibold text-gray-900">{barber.name}</h3>
														<div className="flex flex-wrap gap-2">
															{/* Role Badges */}
															{barber.email && (
																<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
																	CALENDAR VIEWING RIGHTS
																</span>
															)}
															{barber.isActive && (
																<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
																	HAS A LOGIN
																</span>
															)}
															{/* Check if owner/admin based on email or other property */}
															{barber.email?.includes('owner') && (
																<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
																	OWNER'S RIGHTS
																</span>
															)}
															{barber.email?.includes('admin') && (
																<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
																	ADMINISTRATOR RIGHTS
																</span>
															)}
														</div>
													</div>
												</div>

												{/* Right Side - Status */}
												{barber.isActive && (
													<div className="flex items-center gap-2 text-sm text-teal-600">
														<div className="w-2 h-2 rounded-full bg-teal-500"></div>
														<span>Performs services</span>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="bg-white rounded-lg shadow-sm p-12 text-center">
									<User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
									<h3 className="text-lg font-semibold text-gray-700 mb-2">No Employees Yet</h3>
									<p className="text-gray-500 mb-6">Add your first employee to get started</p>
									<button
										onClick={handleCreateEmployee}
										className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition mx-auto inline-flex items-center gap-2"
									>
										<Plus className="w-5 h-5" />
										Create an employee
									</button>
								</div>
							)}
						</div>
					)
				}
				</div>
			</div>

		{/* Modal */}
		{showModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
							<h2 className="text-2xl font-bold mb-6">
								{editingBarber ? 'Edit Barber' : 'Add New Barber'}
							</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">Name *</label>
									<input
										type="text"
										required
										className="w-full px-4 py-2 border rounded-lg"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Email *</label>
									<input
										type="email"
										required
										className="w-full px-4 py-2 border rounded-lg"
										value={formData.email}
										onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Phone</label>
									<input
										type="tel"
										className="w-full px-4 py-2 border rounded-lg"
										value={formData.phone}
										onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">Specialties (comma separated)</label>
									<input
										type="text"
										className="w-full px-4 py-2 border rounded-lg"
										placeholder="Haircut, Beard Trim, Hot Shave"
										value={formData.specialties}
										onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
									/>
								</div>
								<div className="flex space-x-3 pt-4">
									<button
										type="button"
										onClick={() => {
											setShowModal(false);
											setEditingBarber(null);
											setFormData({ name: '', email: '', phone: '', specialties: '' });
										}}
										className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
									>
										{editingBarber ? 'Update' : 'Add'}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

		{/* Schedule Edit Modal */}
		{showScheduleModal && selectedBarber && (
			<div className="fixed inset-0 bg-transparent flex items-center justify-center z-[9999]" onClick={handleCancelScheduleEdit}>
				<div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							{selectedBarber.profileImage ? (
								<img 
									src={selectedBarber.profileImage} 
									alt={selectedBarber.name}
									className="w-12 h-12 rounded-full object-cover"
								/>
							) : (
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
									{selectedBarber.name.charAt(0).toUpperCase()}
								</div>
							)}
							<div>
								<h2 className="text-2xl font-bold text-gray-900">{selectedBarber.name}</h2>
								<p className="text-sm text-gray-600">Edit schedule for week: {weekDates[0].toLocaleDateString('en-CA')} - {weekDates[6].toLocaleDateString('en-CA')}</p>
							</div>
						</div>
						<button onClick={handleCancelScheduleEdit} className="p-2 hover:bg-gray-100 rounded-full">
							<CloseIcon className="w-5 h-5" />
						</button>
					</div>

					<div className="space-y-4">
						{weekScheduleData.map((dayData, index) => {
							const date = weekDates[index];
							const dayName = dayNames[index];
							const isToday = date.toDateString() === new Date().toDateString();
							
							return (
								<div 
									key={index} 
									className={`p-4 border rounded-lg ${
										isToday ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
									}`}
								>
									<div className="flex items-center justify-between mb-3">
										<div>
											<div className={`font-semibold ${isToday ? 'text-indigo-700' : 'text-gray-900'}`}>
												{dayName} {isToday && '(Today)'}
											</div>
											<div className="text-sm text-gray-600">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
										</div>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={dayData.isWorking}
												onChange={(e) => updateWeekScheduleDay(index, 'isWorking', e.target.checked)}
												className="rounded w-5 h-5"
											/>
											<span className="font-medium">{dayData.isWorking ? 'Working' : 'Off'}</span>
										</label>
									</div>
									
									{dayData.isWorking && (
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
												<input
													type="time"
													value={dayData.startTime}
													onChange={(e) => updateWeekScheduleDay(index, 'startTime', e.target.value)}
													className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
												<input
													type="time"
													value={dayData.endTime}
													onChange={(e) => updateWeekScheduleDay(index, 'endTime', e.target.value)}
													className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
												/>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>

					<div className="flex gap-3 mt-6 pt-6 border-t">
						<button
							onClick={handleCancelScheduleEdit}
							className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
						>
							Cancel
						</button>
						<button
							onClick={handleSaveSchedule}
							className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition flex items-center justify-center gap-2"
						>
							<Save className="w-5 h-5" />
							Save Schedule
						</button>
					</div>
				</div>
			</div>
		)}

		{/* Employee Detail Modal */}
		{showEmployeeModal && (
			<div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[9999]" onClick={() => setShowEmployeeModal(false)}>
				<div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
					{/* Modal Header */}
					<div className="flex items-center justify-between px-6 py-4 border-b">
						<h2 className="text-lg font-semibold text-gray-900">
							{selectedBarber ? 'Employee' : 'Create an employee'}
						</h2>
						<button
							onClick={() => setShowEmployeeModal(false)}
							className="text-gray-400 hover:text-gray-600"
						>
							<CloseIcon className="w-5 h-5" />
						</button>
					</div>

					{/* Tabs */}
					<div className="flex border-b px-6">
						<button
							onClick={() => setEmployeeModalTab('basic')}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
								employeeModalTab === 'basic'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							Basic information
						</button>
						<button
							onClick={() => setEmployeeModalTab('prices')}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
								employeeModalTab === 'prices'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							Prices and services
						</button>
						<button
							onClick={() => setEmployeeModalTab('profile')}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
								employeeModalTab === 'profile'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							Profile
						</button>
						<button
							onClick={() => setEmployeeModalTab('calendar')}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
								employeeModalTab === 'calendar'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							External calendar
						</button>
					</div>

					{/* Modal Content */}
					<div className="flex-1 overflow-y-auto p-6">
						{employeeModalTab === 'basic' && (
							<div className="space-y-6">
								{/* Employee Header */}
								<div className="flex gap-6">
									{/* Profile Picture Upload */}
									<div className="flex-shrink-0">
										<div className="relative group">
											{imagePreview ? (
												<img 
													src={imagePreview} 
													alt={employeeFormData.name || 'Employee'}
													className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
												/>
											) : (
												<div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
													{employeeFormData.name?.charAt(0)?.toUpperCase() || 'E'}
												</div>
											)}
											<label 
												htmlFor="barber-image-upload"
												className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full cursor-pointer transition-all"
											>
												<Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
											</label>
											<input
												type="file"
												id="barber-image-upload"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
											/>
										</div>
										{imagePreview && (
											<button
												type="button"
												onClick={() => {
													setImageFile(null);
													setImagePreview(null);
												}}
												className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
											>
												Remove Image
											</button>
										)}
									</div>

									{/* Employee Form Fields */}
									<div className="flex-1 space-y-4">
										<div>
											<label className="block text-sm text-gray-600 mb-1">
												Name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={employeeFormData.name}
												onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
												className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
												placeholder="David"
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm text-gray-600 mb-1">Email address</label>
												<input
													type="email"
													value={employeeFormData.email}
													onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value})}
													className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
													placeholder="david@delegendsbarbershop.lt"
												/>
											</div>
											<div>
												<label className="block text-sm text-gray-600 mb-1">Phone</label>
												<input
													type="tel"
													value={employeeFormData.phone}
													onChange={(e) => setEmployeeFormData({...employeeFormData, phone: e.target.value})}
													className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
													placeholder="+370 692 35485"
												/>
											</div>
										</div>
										
										{/* Password field - only for new employees */}
										{!selectedBarber && (
											<div>
												<label className="block text-sm text-gray-600 mb-1">
													Password <span className="text-red-500">*</span>
												</label>
												<input
													type="password"
													value={employeeFormData.password}
													onChange={(e) => setEmployeeFormData({...employeeFormData, password: e.target.value})}
													className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
													placeholder="Enter password for login"
													required={!selectedBarber}
												/>
												<p className="mt-1 text-xs text-gray-500">Employee will use this to login</p>
											</div>
										)}

										<div className="flex items-center gap-2">
											<input
												type="checkbox"
												id="providesServices"
												checked={employeeFormData.providesServices}
												onChange={(e) => setEmployeeFormData({...employeeFormData, providesServices: e.target.checked})}
												className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
											/>
											<label htmlFor="providesServices" className="text-sm font-medium text-gray-700">
												Provides services
											</label>
										</div>
									</div>
								</div>

								{/* Employment Status */}
								<div className="bg-gray-50 p-6 rounded-lg">
									<h3 className="text-sm font-semibold text-gray-900 mb-2">Employment status</h3>
									<p className="text-sm text-gray-600 mb-4">
										For more detailed insights, you can filter sales reports by employment status.
									</p>
									<div className="flex gap-4">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="employmentStatus"
												value="employee"
												checked={employeeFormData.employmentStatus === 'employee'}
												onChange={(e) => setEmployeeFormData({...employeeFormData, employmentStatus: e.target.value})}
												className="w-4 h-4 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-sm text-gray-700">Employee</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="radio"
												name="employmentStatus"
												value="renting"
												checked={employeeFormData.employmentStatus === 'renting'}
												onChange={(e) => setEmployeeFormData({...employeeFormData, employmentStatus: e.target.value})}
												className="w-4 h-4 text-blue-600 focus:ring-blue-500"
											/>
											<span className="text-sm text-gray-700">Renting a place</span>
										</label>
									</div>
								</div>

								{/* Logging in to Connect */}
								<div>
									<h3 className="text-sm font-semibold text-gray-900 mb-4">Logging in to Connect</h3>
									
									{/* Calendar viewing rights */}
									<div className="mb-4">
										<label className="flex items-start gap-3 cursor-pointer">
											<input
												type="radio"
												name="rights"
												value="calendar-viewing"
												checked={employeeFormData.rights === 'calendar-viewing'}
												onChange={(e) => setEmployeeFormData({...employeeFormData, rights: e.target.value})}
												className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
											/>
											<div className="flex-1">
												<div className="flex items-center justify-between mb-2">
													<span className="text-sm font-medium text-gray-900">Calendar viewing rights</span>
													<button className="text-xs text-blue-600 hover:underline">View and change</button>
												</div>
												<div className="flex flex-wrap gap-2 text-xs">
													<span className="inline-flex items-center gap-1 text-gray-600">
														<Check className="w-3 h-3 text-green-600" />
														View personal calendar
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														<XIcon className="w-3 h-3 text-red-500" />
														Customer data
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														<XIcon className="w-3 h-3 text-red-500" />
														Finances and accounts
													</span>
												</div>
											</div>
										</label>
									</div>

									{/* Calendar management rights */}
									<div className="mb-4">
										<label className="flex items-start gap-3 cursor-pointer">
											<input
												type="radio"
												name="rights"
												value="calendar-management"
												checked={employeeFormData.rights === 'calendar-management'}
												onChange={(e) => setEmployeeFormData({...employeeFormData, rights: e.target.value})}
												className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
											/>
											<div className="flex-1">
												<div className="mb-2">
													<span className="text-sm font-medium text-gray-900">Calendar management rights</span>
												</div>
												<div className="flex flex-wrap gap-2 text-xs">
													<span className="inline-flex items-center gap-1 text-gray-600">
														<Check className="w-3 h-3 text-green-600" />
														Manage personal calendar
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														<XIcon className="w-3 h-3 text-red-500" />
														Customer data
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														<XIcon className="w-3 h-3 text-red-500" />
														Finances and accounts
													</span>
												</div>
											</div>
										</label>
									</div>

									{/* Administrator rights */}
									<div className="mb-4">
										<label className="flex items-start gap-3 cursor-pointer">
											<input
												type="radio"
												name="rights"
												value="administrator"
												checked={employeeFormData.rights === 'administrator'}
												onChange={(e) => setEmployeeFormData({...employeeFormData, rights: e.target.value})}
												className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
											/>
											<div className="flex-1">
												<div className="mb-2">
													<span className="text-sm font-medium text-gray-900">Administrator rights</span>
												</div>
												<div className="flex flex-wrap gap-2 text-xs">
													<span className="inline-flex items-center gap-1 text-gray-600">
														<Check className="w-3 h-3 text-green-600" />
														Manage all calendars
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														Customer data
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														Finances and accounts
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														<Check className="w-3 h-3 text-green-600" />
													</span>
													<span className="inline-flex items-center gap-1 text-gray-600">
														<XIcon className="w-3 h-3 text-red-500" />
													</span>
												</div>
											</div>
										</label>
									</div>

									{/* Owner's rights */}
									<div>
										<label className="flex items-start gap-3 cursor-pointer">
											<input
												type="radio"
												name="rights"
												value="owner"
												checked={employeeFormData.rights === 'owner'}
												onChange={(e) => setEmployeeFormData({...employeeFormData, rights: e.target.value})}
												className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
											/>
											<div className="flex-1">
												<span className="text-sm font-medium text-gray-900">Owner's rights</span>
											</div>
										</label>
									</div>
								</div>
							</div>
						)}

						{/* Prices and Services Tab */}
						{employeeModalTab === 'prices' && (
							<div className="space-y-6">
								<h3 className="text-base font-semibold text-gray-900">
									What services can be ordered from this employee online?
								</h3>

								{/* All Services Checkbox */}
								<div className="pb-4 border-b">
									<label className="flex items-center gap-3 cursor-pointer">
										<input
											type="checkbox"
											checked={isAllServicesSelected()}
											onChange={toggleAllServices}
											className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
										/>
										<span className="text-sm font-semibold text-gray-900">All services</span>
									</label>
								</div>

								{/* Service Categories */}
								<div className="space-y-6">
									{Object.entries(groupServicesByCategory()).map(([category, categoryServices]) => (
										<div key={category} className="space-y-3">
											{/* Category Header */}
											<div className="pb-2 border-b">
												<label className="flex items-center gap-3 cursor-pointer">
													<input
														type="checkbox"
														checked={isCategorySelected(categoryServices)}
														onChange={() => toggleCategory(categoryServices)}
														className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
													/>
													<span className="text-sm font-bold text-gray-900">{category}</span>
												</label>
											</div>

											{/* Sub-services */}
											<div className="pl-7 space-y-2">
												{categoryServices.map(service => (
													<label key={service._id} className="flex items-center gap-3 cursor-pointer">
														<input
															type="checkbox"
															checked={selectedServices.includes(service._id)}
															onChange={() => toggleService(service._id)}
															className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
														/>
														<span className="text-sm text-gray-700">{service.name}</span>
													</label>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Profile Tab */}
						{employeeModalTab === 'profile' && (
							<div className="space-y-6">
								{/* Info Banner */}
								<div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
									<div className="flex-shrink-0">
										<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
										</svg>
									</div>
									<p className="text-sm text-blue-900">
										Your customers will see your profile online. Try to make a good impression on them.
									</p>
								</div>

								{/* Duties/Profession Field */}
								<div>
									<label className="block text-sm font-medium text-gray-600 mb-2">
										Duties
									</label>
									<input
										type="text"
										value={employeeFormData.profession || ''}
										onChange={(e) => setEmployeeFormData({...employeeFormData, profession: e.target.value})}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
										placeholder="Professional Barber"
									/>
								</div>

								{/* Description Field */}
								<div>
									<textarea
										value={employeeFormData.description || ''}
										onChange={(e) => setEmployeeFormData({...employeeFormData, description: e.target.value})}
										rows="5"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
										placeholder="I am a professional barber. This is my happy place. Where people make your hair look good and you feel good."
									/>
								</div>
							</div>
						)}
					</div>

					{/* Modal Footer */}
					<div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setShowEmployeeModal(false)}
								className="text-sm text-gray-600 hover:text-gray-900"
							>
								Cancel
							</button>
							{selectedBarber && (
								<>
									<button 
										onClick={() => handleDelete(selectedBarber._id)}
										className="text-sm text-red-600 hover:text-red-700 font-medium"
									>
										Delete
									</button>
									<button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
										<MoreHorizontal className="w-4 h-4" />
										More
									</button>
								</>
							)}
						</div>
						<button 
							onClick={handleSaveEmployee}
							disabled={uploading}
							className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 ${
								uploading ? 'opacity-50 cursor-not-allowed' : ''
							}`}
						>
							{uploading ? (
								<>
									<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Uploading...
								</>
							) : (
								selectedBarber ? 'Store' : 'Create'
							)}
						</button>
					</div>
				</div>
			</div>
		)}
		</AdminLayout>
	);
};

export default AdminTeam;

