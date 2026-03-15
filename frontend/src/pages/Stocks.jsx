import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function Stocks() {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", quantity: "", unit: "" });
    const [stocks, setStocks] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ✅ Only allow images
        if (!file.type.startsWith('image/')) {
            showToast("Please select an image file only.");
            return;
        }
        // ✅ Max 5MB
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

    // Toast function
    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        navigate("/");
    };

    const openAdd = () => {
        setForm({ name: "", category: "", quantity: "", unit: "" });
        setEditingItem(null);
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    useEffect(() => {
        const token = localStorage.getItem("token"); 
        fetch("https://beautydelounge-backend.onrender.com/api/stocks", {
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        })
            .then(res => res.json())
            .then(data => setStocks(data))
            .catch(err => console.error("Failed to fetch stocks", err));
    }, []);

  const handleSave = async () => {
        if (!form.name || !form.quantity) return showToast("Please fill in all fields.");
        try {
            const token = localStorage.getItem("token"); 
            const imageUrl = await uploadImage();
            const finalForm = imageUrl ? { ...form, imageUrl } : form;
            
            if (editingItem) {
                const res = await fetch(`https://beautydelounge-backend.onrender.com/api/stocks/${editingItem}`, {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(finalForm)
                });
                const updated = await res.json();
                setStocks(stocks.map(s => s._id === editingItem ? updated : s));
            } else {
                const res = await fetch("https://beautydelounge-backend.onrender.com/api/stocks", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(finalForm)
                });
                const created = await res.json();
                setStocks([...stocks, created]);
            }
            setShowForm(false);
            showToast(editingItem ? "Item updated." : "Item added.", "success");
        } catch (err) {
            console.error(err);
            showToast("Something went wrong. Please try again.");
        }
    };

    const handleDelete = (id) => {
        setConfirmDelete(id);
    };

   const confirmDeleteAction = async () => {
        const token = localStorage.getItem("token"); 
        await fetch(`https://beautydelounge-backend.onrender.com/api/stocks/${confirmDelete}`, { 
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}` 
            }
        });
        setStocks(stocks.filter(s => s._id !== confirmDelete));
        setConfirmDelete(null);
        showToast("Item deleted.", "success");
    };

    const openEdit = (item) => {
        setForm(item);
        setEditingItem(item._id);
        setImagePreview(item.imageUrl || ''); 
        setImageFile(null);                  
        setShowForm(true);
    };

    return (
        <div className="dashboard-container">
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
                    <h1>Stocks</h1>
                    <p>Manage your inventory</p>
                </header>

                <button className="add-btn" onClick={openAdd}><FaPlus /> Add Item</button>

                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>{editingItem ? "Edit Item" : "Add Item"}</h3>
                            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                            <input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                            <input placeholder="Unit (e.g. bottles)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                            <div className="image-upload-box" onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('stockImageInput').click();
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
                                id="stockImageInput"
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
                    {stocks.map(item => (
                        <div key={item._id} className="stock-card">
                            <div className="stock-card-image">
                                {item.imageUrl
                                    ? <img src={item.imageUrl} alt={item.name} />
                                    : <div className="stock-no-image">📦</div>
                                }
                            </div>
                            <div className="stock-card-body">
                                <h3 className="stock-card-name">{item.name}</h3>
                                <p className="stock-card-category">{item.category}</p>
                                <div className="stock-card-footer">
                                    <span className="stock-card-qty">
                                        {item.quantity} <span className="stock-card-unit">{item.unit}</span>
                                    </span>
                                    <div className="stock-card-actions">
                                        <button className="icon-btn edit" onClick={() => openEdit(item)}><FaEdit /></button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(item._id)}><FaTrash /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                        <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
                        <h3 style={{ marginBottom: '8px' }}>Delete Item?</h3>
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

            {/* Toast */}
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

export default Stocks;