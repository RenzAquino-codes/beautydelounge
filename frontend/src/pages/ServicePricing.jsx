import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTags } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
const API = "https://beautydelounge-backend.onrender.com";

function ServicePricing() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("staff"));
    let isAdmin = false;
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            isAdmin = decoded.role === 'admin' || decoded.role === 'static-admin';
        }
    } catch (e) {}

    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", price: "" });
    const [services, setServices] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Category management
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);

    const token = () => localStorage.getItem("token");

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Fetch service categories
    const fetchCategories = () => {
        fetch(`${API}/api/categories?type=service`, {
            headers: { "Authorization": `Bearer ${token()}` }
        })
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(err => console.error("Failed to fetch categories", err));
    };

    useEffect(() => {
        fetch(`${API}/api/services`, {
            headers: { "Authorization": `Bearer ${token()}` }
        })
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error("Failed to fetch services", err));

        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return showToast("Please select an image file only.");
        if (file.size > 5 * 1024 * 1024) return showToast("Image must be less than 5MB.");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const res = await fetch(`${API}/api/upload`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token()}` },
                body: formData
            });
            const data = await res.json();
            return data.imageUrl;
        } catch (err) {
            showToast("Image upload failed.");
            return null;
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const openAdd = () => {
        setForm({ name: "", category: "", price: "" });
        setEditingItem(null);
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price) return showToast("Please fill in all fields.");
        setIsSaving(true);
        try {
            const imageUrl = await uploadImage();
            const finalForm = imageUrl ? { ...form, imageUrl } : form;
            const url = editingItem
                ? `${API}/api/services/${editingItem}`
                : `${API}/api/services`;

            const res = await fetch(url, {
                method: editingItem ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
                body: JSON.stringify(finalForm)
            });

            if (res.ok) {
                const data = await res.json();
                setServices(editingItem
                    ? services.map(s => s._id === editingItem ? data : s)
                    : [...services, data]
                );
                setShowForm(false);
                showToast(editingItem ? "Updated!" : "Added!", "success");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteAction = async () => {
        await fetch(`${API}/api/services/${confirmDelete}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token()}` }
        });
        setServices(services.filter(s => s._id !== confirmDelete));
        setConfirmDelete(null);
        showToast("Service deleted.", "success");
    };

    const openEdit = (item) => {
        setForm(item);
        setEditingItem(item._id);
        setImagePreview(item.imageUrl || '');
        setImageFile(null);
        setShowForm(true);
    };

    // ── Category management (admin only) ──────────────────────────
    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return showToast("Please enter a category name.");
        setIsSavingCategory(true);
        try {
            const res = await fetch(`${API}/api/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
                body: JSON.stringify({ name, type: "service" })
            });
            const data = await res.json();
            if (!res.ok) return showToast(data.error || "Failed to add category.");
            setCategories([...categories, data]);
            setNewCategoryName("");
            showToast("Category added.", "success");
        } catch (err) {
            showToast("Failed to add category.");
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await fetch(`${API}/api/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token()}` }
            });
            setCategories(categories.filter(c => c._id !== id));
            showToast("Category deleted.", "success");
        } catch (err) {
            showToast("Failed to delete category.");
        } finally {
            setConfirmDeleteCategory(null);
        }
    };

    // Filter Logic
    const filterOptions = ["All", ...categories.map(c => c.name)];
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="dashboard-container">
            {isSaving && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p className="loading-text">SYNCING WITH CLOUD...</p>
                </div>
            )}
            <aside className="sidebar">
                <h2>BEA-UTY DE LOUNGE</h2>
                <nav>
                    <div className="nav-item" onClick={() => navigate("/dashboard")}><FaArrowLeft /> <span>Back</span></div>
                    <div className="nav-item logout" onClick={handleLogout}><HiArrowLeftEndOnRectangle /> <span>Logout</span></div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Service Pricing</h1>
                    <p>Manage your services and prices</p>
                    <div className="filter-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="category-filter">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="filter-select"
                            >
                                {filterOptions.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="add-btn" onClick={openAdd}><FaPlus /> Add Service</button>
                    {isAdmin && (
                        <button
                            className="add-btn"
                            style={{ background: '#8c7a60' }}
                            onClick={() => setShowCategoryModal(true)}
                        >
                            <FaTags /> Manage Categories
                        </button>
                    )}
                </div>

                {/* Add / Edit Service Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>{editingItem ? "Edit Service" : "Add Service"}</h3>
                            <input
                                placeholder="Service Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />

                            {/* Category dropdown */}
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #dcd5c9',
                                    background: '#faf8f5',
                                    color: form.category ? '#3a3020' : '#8c7a60',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">— Select Category —</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>

                            <input
                                placeholder="Price (₱)"
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                            />
                            <div className="image-upload-box" onClick={() => document.getElementById('serviceImageInput').click()}>
                                {imagePreview
                                    ? <img src={imagePreview} alt="preview" className="image-preview" />
                                    : <div className="image-upload-placeholder"><span>Click to add image</span></div>
                                }
                            </div>
                            <input
                                id="serviceImageInput"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                            <div className="modal-actions">
                                <button onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="stocks-grid">
                    {filteredServices.length > 0 ? (
                        filteredServices.map(item => (
                            <div key={item._id} className="stock-card">
                                <div className="stock-card-image">
                                    {item.imageUrl
                                        ? <img src={item.imageUrl} alt={item.name} />
                                        : <div className="stock-no-image">✂️</div>
                                    }
                                </div>
                                <div className="stock-card-body">
                                    <h3 className="stock-card-name">{item.name}</h3>
                                    <p className="stock-card-category">{item.category}</p>
                                    <div className="stock-card-footer">
                                        <span className="stock-card-qty">₱{item.price}</span>
                                        <div className="stock-card-actions">
                                            <button className="icon-btn edit" onClick={() => openEdit(item)}><FaEdit /></button>
                                            <button className="icon-btn delete" onClick={() => setConfirmDelete(item._id)}><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No services found.</p>
                    )}
                </div>
            </main>

            {/* Manage Categories Modal (admin only) */}
            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '420px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Manage Service Categories</h3>

                        {/* Add new category */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '10px',
                            marginBottom: '20px',
                            alignItems: 'stretch'
                        }}>
                            <input
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    border: '2px solid #c9a84c',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    color: '#3a3020',
                                    background: '#fffaf5',
                                    outline: 'none',
                                }}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={isSavingCategory}
                                style={{
                                    padding: '0 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#c9a84c',
                                    color: '#ffffff',
                                    cursor: isSavingCategory ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap' // Prevents text from wrapping
                                }}
                            >
                                {isSavingCategory ? '...' : <><FaPlus /> Add</>}
                            </button>
                        </div>

                        {/* Category list */}
                        <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                            {categories.length === 0 ? (
                                <p style={{ color: '#8c7a60', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                                    No categories yet. Add one above.
                                </p>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat._id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
                                        background: '#faf8f5', border: '1px solid #e8e0d4'
                                    }}>
                                        <span style={{ color: '#3a3020', fontSize: '14px' }}>{cat.name}</span>
                                        <button
                                            className="icon-btn delete"
                                            onClick={() => setConfirmDeleteCategory(cat._id)}
                                            style={{ marginLeft: '8px' }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="modal-actions" style={{ marginTop: '16px' }}>
                            <button className="cancel-btn" onClick={() => setShowCategoryModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Category */}
            {confirmDeleteCategory && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
                        <h3 style={{ marginBottom: '8px' }}>Delete Category?</h3>
                        <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>
                            Existing services with this category will not be affected.
                        </p>
                        <div className="modal-actions">
                            <button onClick={() => handleDeleteCategory(confirmDeleteCategory)} style={{ background: '#e74c3c' }}>
                                Yes, Delete
                            </button>
                            <button className="cancel-btn" onClick={() => setConfirmDeleteCategory(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Service */}
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
                        <h3>Delete Service?</h3>
                        <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={confirmDeleteAction} style={{ background: '#e74c3c' }}>Yes, Delete</button>
                            <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">{toast.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}</span>
                    <span className="toast-message">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default ServicePricing;