import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { productsAPI } from '../utils/api';
import { Plus, Edit2, Trash2, Package, X, Upload, Image as ImageIcon } from 'lucide-react';

const AdminProducts = () => {
	const [products, setProducts] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		price: '',
		imageUrl: '',
		category: 'Hair care',
		stock: 0,
	});

	const categories = ['Hair care', 'Face and body', 'Beards', 'Hairdressing supplies'];

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		try {
			const response = await productsAPI.getAllProducts();
			setProducts(response.data);
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Upload image first if a new file is selected
			let imageUrl = formData.imageUrl;
			
			if (imageFile) {
				console.log('Uploading image...');
				setUploading(true);
				const uploadFormData = new FormData();
				uploadFormData.append('image', imageFile);
				
				try {
					const uploadResponse = await productsAPI.uploadImage(uploadFormData);
					console.log('Upload response:', uploadResponse.data);
					imageUrl = uploadResponse.data.imageUrl;
					setUploading(false);
				} catch (uploadError) {
					console.error('Image upload failed:', uploadError);
					const errorMsg = uploadError.response?.data?.message || uploadError.message || 'Image upload failed';
					alert('Image upload failed: ' + errorMsg + '\n\nPlease check:\n1. Cloudinary credentials are set in .env\n2. Backend server is running\n3. You are logged in as admin');
					setUploading(false);
					return;
				}
			}

			if (!imageUrl) {
				alert('Please upload an image');
				return;
			}

			const productData = {
				...formData,
				imageUrl,
			};

			console.log('Saving product:', productData);

			if (editingProduct) {
				await productsAPI.update(editingProduct._id, productData);
			} else {
				await productsAPI.create(productData);
			}

			fetchProducts();
			setShowModal(false);
			setEditingProduct(null);
			resetForm();
		} catch (error) {
			console.error('Error saving product:', error);
			console.error('Error details:', error.response?.data);
			const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
			alert('Failed to save product: ' + errorMsg);
			setUploading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			price: '',
			imageUrl: '',
			category: 'Hair care',
			stock: 0,
		});
		setImageFile(null);
		setImagePreview(null);
	};

	const handleEdit = (product) => {
		setEditingProduct(product);
		setFormData({
			title: product.title,
			description: product.description,
			price: product.price,
			imageUrl: product.imageUrl,
			category: product.category,
			stock: product.stock,
		});
		setImagePreview(product.imageUrl);
		setShowModal(true);
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				alert('File size must be less than 5MB');
				return;
			}
			setImageFile(file);
			
			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Are you sure you want to delete this product?')) return;
		try {
			await productsAPI.delete(id);
			fetchProducts();
		} catch (error) {
			console.error('Error deleting product:', error);
			alert('Failed to delete product');
		}
	};

	const toggleActive = async (product) => {
		try {
			await productsAPI.update(product._id, { ...product, isActive: !product.isActive });
			fetchProducts();
		} catch (error) {
			console.error('Error updating product:', error);
		}
	};

	return (
		<AdminLayout>
			<div className="p-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
						<p className="text-gray-600 mt-1">Manage your shop products and inventory</p>
					</div>
					<button
						onClick={() => {
							setEditingProduct(null);
							resetForm();
							setShowModal(true);
						}}
						className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition shadow-lg"
					>
						<Plus className="w-5 h-5" />
						<span>Add Product</span>
					</button>
				</div>

				{/* Products Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{products.map((product) => (
						<div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
							{/* Product Image */}
							<div className="h-48 bg-gray-200 overflow-hidden">
								<img 
									src={product.imageUrl} 
									alt={product.title}
									className="w-full h-full object-cover"
									onError={(e) => {
										e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
									}}
								/>
							</div>

							{/* Product Info */}
							<div className="p-4">
								<div className="flex items-start justify-between mb-2">
									<h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.title}</h3>
									<button
										onClick={() => toggleActive(product)}
										className={`px-2 py-1 rounded text-xs font-semibold ${
											product.isActive
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-800'
										}`}
									>
										{product.isActive ? 'Active' : 'Inactive'}
									</button>
								</div>

								<p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

								<div className="flex items-center justify-between mb-3">
									<span className="text-2xl font-bold text-yellow-600">€{product.price}</span>
									<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
										{product.category}
									</span>
								</div>

								<div className="flex items-center justify-between text-sm text-gray-600 mb-4">
									<span className="flex items-center">
										<Package className="w-4 h-4 mr-1" />
										Stock: {product.stock}
									</span>
								</div>

								{/* Action Buttons */}
								<div className="flex space-x-2">
									<button
										onClick={() => handleEdit(product)}
										className="flex-1 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition flex items-center justify-center"
									>
										<Edit2 className="w-4 h-4 mr-1" />
										Edit
									</button>
									<button
										onClick={() => handleDelete(product._id)}
										className="flex-1 p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded transition flex items-center justify-center"
									>
										<Trash2 className="w-4 h-4 mr-1" />
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{products.length === 0 && (
					<div className="text-center py-20">
						<Package className="w-20 h-20 mx-auto text-gray-300 mb-4" />
						<p className="text-gray-500 text-lg">No products yet. Add your first product!</p>
					</div>
				)}

				{/* Add/Edit Product Modal */}
				{showModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold">
									{editingProduct ? 'Edit Product' : 'Add New Product'}
								</h2>
								<button
									onClick={() => {
										setShowModal(false);
										setEditingProduct(null);
										resetForm();
									}}
									className="p-2 hover:bg-gray-100 rounded-full"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">Product Title *</label>
									<input
										type="text"
										required
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										placeholder="e.g., Premium Hair Wax"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Description *</label>
									<textarea
										required
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
										rows="4"
										value={formData.description}
										onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										placeholder="Describe the product features and benefits..."
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium mb-2">Price (€) *</label>
										<input
											type="number"
											required
											min="0"
											step="0.01"
											className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
											value={formData.price}
											onChange={(e) => setFormData({ ...formData, price: e.target.value })}
											placeholder="29.99"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium mb-2">Stock Quantity *</label>
										<input
											type="number"
											required
											min="0"
											className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
											value={formData.stock}
											onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
											placeholder="50"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Category *</label>
									<select
										required
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
										value={formData.category}
										onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									>
										{categories.map(cat => (
											<option key={cat} value={cat}>{cat}</option>
										))}
									</select>
								</div>

								{/* Image Upload Section */}
								<div>
									<label className="block text-sm font-medium mb-2">Product Image *</label>
									
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
										<div className="text-center">
											{imagePreview ? (
												<div className="space-y-3">
													<img 
														src={imagePreview} 
														alt="Preview" 
														className="h-48 w-48 object-cover rounded mx-auto border-4 border-blue-200"
													/>
													<button
														type="button"
														onClick={() => {
															setImageFile(null);
															setImagePreview(null);
															setFormData({ ...formData, imageUrl: '' });
														}}
														className="text-sm text-red-600 hover:text-red-800 font-medium"
													>
														Remove Image
													</button>
												</div>
											) : (
												<div>
													<ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-3" />
													<p className="text-gray-600 mb-2">Upload product image</p>
													<p className="text-xs text-gray-500 mb-4">JPG, PNG, WEBP or GIF (Max 5MB)</p>
												</div>
											)}
											
											<input
												type="file"
												id="image-upload"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
												required={!editingProduct && !imagePreview}
											/>
											<label
												htmlFor="image-upload"
												className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
											>
												<Upload className="w-5 h-5 mr-2" />
												{imagePreview ? 'Change Image' : 'Choose Image'}
											</label>
										</div>
									</div>
								</div>

								<div className="flex space-x-3 pt-4">
									<button
										type="button"
										onClick={() => {
											setShowModal(false);
											setEditingProduct(null);
											resetForm();
										}}
										className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={uploading}
										className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
									>
										{uploading ? 'Uploading...' : (editingProduct ? 'Update Product' : 'Add Product')}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default AdminProducts;
