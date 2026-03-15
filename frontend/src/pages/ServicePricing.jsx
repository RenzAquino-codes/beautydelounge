import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function ServicePricing() {
    const navigate = useNavigate();
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
    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showToast("Please select an image file only.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast("Image must be less than 5MB.");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };


    const uploadImage = async () => {
        if (!imageFile) return null;
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append('image', imageFile);
            const res = await fetch('https://beautydelounge-backend.onrender.com/api/upload', {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });
            if (!res.ok) {
                showToast("Image upload failed. Saving without image.");
                return null;
            }
            const data = await res.json();
            return data.imageUrl;
        } catch (err) {
            showToast("Image upload failed. Saving without image.");
            return null;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const openAdd = () => {
        setForm({ name: "", category: "", price: "" });
        setEditingItem(null);
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("https://beautydelounge-backend.onrender.com/api/services", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error("Failed to fetch services", err));
    }, []);

    const handleSave = async () => {
        if (!form.name || !form.price) return showToast("Please fill in all fields.");

        setIsSaving(true);

        try {
            const token = localStorage.getItem("token");
            const imageUrl = await uploadImage();
            const finalForm = imageUrl ? { ...form, imageUrl } : form;

            const url = editingItem
                ? `https://beautydelounge-backend.onrender.com/api/services/${editingItem}`
                : "https://beautydelounge-backend.onrender.com/api/services";

            const method = editingItem ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(finalForm)
            });

            if (res.ok) {
                const data = await res.json();
                if (editingItem) {
                    setServices(services.map(s => s._id === editingItem ? data : s));
                } else {
                    setServices([...services, data]);
                }
                setShowForm(false);
                showToast(editingItem ? "Service updated." : "Service added.", "success");
            }
        } catch (err) {
            showToast("Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };
    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

    const confirmDeleteAction = async () => {
        const token = localStorage.getItem("token");
        await fetch(`https://beautydelounge-backend.onrender.com/api/services/${confirmDelete}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
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

    const categories = ["All", ...new Set(services.map(s => s.category).filter(Boolean))];

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
                    <div className="nav-item" onClick={() => navigate("/dashboard")}>
                        <FaArrowLeft /> <span>Back</span>
                    </div>
                    <div className="nav-item logout" onClick={handleLogout}>
                        <HiArrowLeftEndOnRectangle /> <span>Logout</span>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Service Pricing</h1>
                    <p>Manage your services and prices</p>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
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
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                <button className="add-btn" onClick={openAdd}><FaPlus /> Add Service</button>

                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>{editingItem ? "Edit Service" : "Add Service"}</h3>
                            <input placeholder="Service Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                            <input placeholder="Price (₱)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />


                            <div className="image-upload-box" onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('serviceImageInput').click();
                            }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="image-preview" />
                                ) : (
                                    <div className="image-upload-placeholder">
                                        <span>Click to add image</span>
                                    </div>
                                )}
                            </div>
                            <input
                                key={editingItem || 'new'}
                                id="serviceImageInput"
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />

                            <div className="modal-actions">
                                <button onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={() => {
                                    setShowForm(false);
                                    setImageFile(null);
                                    setImagePreview('');
                                }}>Cancel</button>
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
                                            <button className="icon-btn delete" onClick={() => handleDelete(item._id)}><FaTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No services found matching your search.</p>
                    )}
                </div>

            </main>

            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
                        <h3 style={{ marginBottom: '8px' }}>Delete Service?</h3>
                        <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button onClick={confirmDeleteAction} style={{ background: '#e74c3c' }}>
                                Yes, Delete
                            </button>
                            <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default ServicePricing;