// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
// import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTags } from "react-icons/fa";
// import { jwtDecode } from "jwt-decode";
// const API = "https://beautydelounge-backend.onrender.com";

// function ServicePricing() {
//     const navigate = useNavigate();

//     let isAdmin = false;
//     try {
//         const token = localStorage.getItem("token");
//         if (token) {
//             const decoded = jwtDecode(token);
//             isAdmin = decoded.role === 'admin' || decoded.role === 'static-admin';
//         }
//     } catch (e) { }

//     const [showForm, setShowForm] = useState(false);
//     const [editingItem, setEditingItem] = useState(null);
//     const [form, setForm] = useState({ name: "", category: "", price: "" });
//     const [services, setServices] = useState([]);
//     const [toast, setToast] = useState({ show: false, message: '', type: '' });
//     const [confirmDelete, setConfirmDelete] = useState(null);
//     const [imageFile, setImageFile] = useState(null);
//     const [imagePreview, setImagePreview] = useState('');
//     const [isSaving, setIsSaving] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("All");

//     // Category management
//     const [categories, setCategories] = useState([]);
//     const [showCategoryModal, setShowCategoryModal] = useState(false);
//     const [newCategoryName, setNewCategoryName] = useState("");
//     const [isSavingCategory, setIsSavingCategory] = useState(false);
//     const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);

//     const token = () => localStorage.getItem("token");

//     const showToast = (message, type = 'error') => {
//         setToast({ show: true, message, type });
//         setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
//     };

//     // Fetch service categories
//     const fetchCategories = () => {
//         fetch(`${API}/api/categories?type=service`, {
//             headers: { "Authorization": `Bearer ${token()}` }
//         })
//             .then(res => res.json())
//             .then(data => setCategories(Array.isArray(data) ? data : []))
//             .catch(err => console.error("Failed to fetch categories", err));
//     };

//     useEffect(() => {
//         fetch(`${API}/api/services`, {
//             headers: { "Authorization": `Bearer ${token()}` }
//         })
//             .then(res => res.json())
//             .then(data => setServices(data))
//             .catch(err => console.error("Failed to fetch services", err));

//         fetchCategories();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
//         if (!file.type.startsWith('image/')) return showToast("Please select an image file only.");
//         if (file.size > 5 * 1024 * 1024) return showToast("Image must be less than 5MB.");
//         setImageFile(file);
//         setImagePreview(URL.createObjectURL(file));
//     };

//     const uploadImage = async () => {
//         if (!imageFile) return null;
//         try {
//             const formData = new FormData();
//             formData.append('image', imageFile);
//             const res = await fetch(`${API}/api/upload`, {
//                 method: 'POST',
//                 headers: { "Authorization": `Bearer ${token()}` },
//                 body: formData
//             });
//             const data = await res.json();
//             return data.imageUrl;
//         } catch (err) {
//             showToast("Image upload failed.");
//             return null;
//         }
//     };

//     const handleLogout = () => {
//         localStorage.clear();
//         navigate("/");
//     };

//     const openAdd = () => {
//         setForm({ name: "", category: "", price: "" });
//         setEditingItem(null);
//         setImageFile(null);
//         setImagePreview('');
//         setShowForm(true);
//     };

//     const handleSave = async () => {
//         if (!form.name || !form.price) return showToast("Please fill in all fields.");
//         if (Number(form.price) <= 0) return showToast("Price must be greater than zero.");
//         setIsSaving(true);
//         try {
//             const imageUrl = await uploadImage();
//             const finalForm = imageUrl ? { ...form, imageUrl } : form;
//             const url = editingItem
//                 ? `${API}/api/services/${editingItem}`
//                 : `${API}/api/services`;

//             const res = await fetch(url, {
//                 method: editingItem ? "PUT" : "POST",
//                 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
//                 body: JSON.stringify(finalForm)
//             });

//             if (res.ok) {
//                 const data = await res.json();
//                 setServices(editingItem
//                     ? services.map(s => s._id === editingItem ? data : s)
//                     : [...services, data]
//                 );
//                 setShowForm(false);
//                 showToast(editingItem ? "Updated!" : "Added!", "success");
//             }
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const confirmDeleteAction = async () => {
//         await fetch(`${API}/api/services/${confirmDelete}`, {
//             method: "DELETE",
//             headers: { "Authorization": `Bearer ${token()}` }
//         });
//         setServices(services.filter(s => s._id !== confirmDelete));
//         setConfirmDelete(null);
//         showToast("Service deleted.", "success");
//     };

//     const openEdit = (item) => {
//         setForm(item);
//         setEditingItem(item._id);
//         setImagePreview(item.imageUrl || '');
//         setImageFile(null);
//         setShowForm(true);
//     };

//     // ── Category management (admin only) ──────────────────────────
//     const handleAddCategory = async () => {
//         const name = newCategoryName.trim();
//         if (!name) return showToast("Please enter a category name.");
//         setIsSavingCategory(true);
//         try {
//             const res = await fetch(`${API}/api/categories`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
//                 body: JSON.stringify({ name, type: "service" })
//             });
//             const data = await res.json();
//             if (!res.ok) return showToast(data.error || "Failed to add category.");
//             setCategories([...categories, data]);
//             setNewCategoryName("");
//             showToast("Category added.", "success");
//         } catch (err) {
//             showToast("Failed to add category.");
//         } finally {
//             setIsSavingCategory(false);
//         }
//     };

//     const handleDeleteCategory = async (id) => {
//         try {
//             await fetch(`${API}/api/categories/${id}`, {
//                 method: "DELETE",
//                 headers: { "Authorization": `Bearer ${token()}` }
//             });
//             setCategories(categories.filter(c => c._id !== id));
//             showToast("Category deleted.", "success");
//         } catch (err) {
//             showToast("Failed to delete category.");
//         } finally {
//             setConfirmDeleteCategory(null);
//         }
//     };

//     // Filter Logic
//     const filterOptions = ["All", ...categories.map(c => c.name)];
//     const filteredServices = services.filter(service => {
//         const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
//         return matchesSearch && matchesCategory;
//     });

//     return (
//         <div className="dashboard-container">
//             {isSaving && (
//                 <div className="loading-overlay">
//                     <div className="spinner"></div>
//                     <p className="loading-text">SYNCING WITH CLOUD...</p>
//                 </div>
//             )}
//             <aside className="sidebar">
//                 <h2>BEA-UTY DE LOUNGE</h2>
//                 <nav>
//                     <div className="nav-item" onClick={() => navigate("/dashboard")}><FaArrowLeft /> <span>Back</span></div>
//                     <div className="nav-item logout" onClick={handleLogout}><HiArrowLeftEndOnRectangle /> <span>Logout</span></div>
//                 </nav>
//             </aside>

//             <main className="main-content">
//                 <header className="dashboard-header">
//                     <h1>Service Pricing</h1>
//                     <p>Manage your services and prices</p>
//                     <div className="filter-controls">
//                         <div className="search-container">
//                             <input
//                                 type="text"
//                                 placeholder="Search services..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="search-input"
//                             />
//                         </div>
//                         <div className="category-filter">
//                             <select
//                                 value={selectedCategory}
//                                 onChange={(e) => setSelectedCategory(e.target.value)}
//                                 className="filter-select"
//                             >
//                                 {filterOptions.map(cat => (
//                                     <option key={cat} value={cat}>{cat}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </header>

//                 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//                     <button className="add-btn" onClick={openAdd}><FaPlus /> Add Service</button>
//                     {isAdmin && (
//                         <button
//                             className="add-btn"
//                             style={{ background: '#8c7a60' }}
//                             onClick={() => setShowCategoryModal(true)}
//                         >
//                             <FaTags /> Manage Categories
//                         </button>
//                     )}
//                 </div>

//                 {/* Add / Edit Service Modal */}
//                 {showForm && (
//                     <div className="modal-overlay">
//                         <div className="modal">
//                             <h3>{editingItem ? "Edit Service" : "Add Service"}</h3>
//                             <input
//                                 placeholder="Service Name"
//                                 value={form.name}
//                                 onChange={e => setForm({ ...form, name: e.target.value })}
//                             />

//                             {/* Category dropdown */}
//                             <select
//                                 value={form.category}
//                                 onChange={e => setForm({ ...form, category: e.target.value })}
//                                 style={{
//                                     width: '100%',
//                                     padding: '10px 12px',
//                                     borderRadius: '8px',
//                                     border: '1px solid #dcd5c9',
//                                     background: '#faf8f5',
//                                     color: form.category ? '#3a3020' : '#8c7a60',
//                                     fontSize: '14px'
//                                 }}
//                             >
//                                 <option value="">— Select Category —</option>
//                                 {categories.map(cat => (
//                                     <option key={cat._id} value={cat.name}>{cat.name}</option>
//                                 ))}
//                             </select>

//                             <input
//                                 placeholder="Price (₱)"
//                                 type="number"
//                                 min="1"
//                                 value={form.price}
//                                 onChange={e => setForm({ ...form, price: e.target.value })}
//                                 onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
//                             />
                            
//                             <div className="image-upload-box" onClick={() => document.getElementById('serviceImageInput').click()}>
//                                 {imagePreview
//                                     ? <img src={imagePreview} alt="preview" className="image-preview" />
//                                     : <div className="image-upload-placeholder"><span>Click to add image</span></div>
//                                 }
//                             </div>
//                             <input
//                                 id="serviceImageInput"
//                                 type="file"
//                                 accept="image/*"
//                                 style={{ display: 'none' }}
//                                 onChange={handleImageChange}
//                             />
//                             <div className="modal-actions">
//                                 <button onClick={handleSave}>Save</button>
//                                 <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 <div className="stocks-grid">
//                     {filteredServices.length > 0 ? (
//                         filteredServices.map(item => (
//                             <div key={item._id} className="stock-card">
//                                 <div className="stock-card-image">
//                                     {item.imageUrl
//                                         ? <img src={item.imageUrl} alt={item.name} />
//                                         : <div className="stock-no-image">✂️</div>
//                                     }
//                                 </div>
//                                 <div className="stock-card-body">
//                                     <h3 className="stock-card-name">{item.name}</h3>
//                                     <p className="stock-card-category">{item.category}</p>
//                                     <div className="stock-card-footer">
//                                         <span className="stock-card-qty">₱{item.price}</span>
//                                         <div className="stock-card-actions">
//                                             <button className="icon-btn edit" onClick={() => openEdit(item)}><FaEdit /></button>
//                                             <button className="icon-btn delete" onClick={() => setConfirmDelete(item._id)}><FaTrash /></button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <p className="no-results">No services found.</p>
//                     )}
//                 </div>
//             </main>

//             {/* Manage Categories Modal (admin only) */}
//             {showCategoryModal && (
//                 <div className="modal-overlay">
//                     <div className="modal" style={{ maxWidth: '420px' }}>
//                         <h3 style={{ marginBottom: '16px' }}>Manage Service Categories</h3>

//                         {/* Add new category */}
//                         <div style={{
//                             display: 'grid',
//                             gridTemplateColumns: '1fr auto',
//                             gap: '10px',
//                             marginBottom: '20px',
//                             alignItems: 'stretch'
//                         }}>
//                             <input
//                                 placeholder="New category name..."
//                                 value={newCategoryName}
//                                 onChange={e => setNewCategoryName(e.target.value)}
//                                 onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
//                                 style={{
//                                     width: '100%',
//                                     padding: '12px 14px',
//                                     border: '2px solid #c9a84c',
//                                     borderRadius: '8px',
//                                     fontSize: '15px',
//                                     color: '#3a3020',
//                                     background: '#fffaf5',
//                                     outline: 'none',
//                                 }}
//                             />
//                             <button
//                                 onClick={handleAddCategory}
//                                 disabled={isSavingCategory}
//                                 style={{
//                                     padding: '0 24px',
//                                     borderRadius: '8px',
//                                     border: 'none',
//                                     background: '#c9a84c',
//                                     color: '#ffffff',
//                                     cursor: isSavingCategory ? 'not-allowed' : 'pointer',
//                                     fontWeight: '600',
//                                     fontSize: '14px',
//                                     whiteSpace: 'nowrap' // Prevents text from wrapping
//                                 }}
//                             >
//                                 {isSavingCategory ? '...' : <><FaPlus /> Add</>}
//                             </button>
//                         </div>

//                         {/* Category list */}
//                         <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
//                             {categories.length === 0 ? (
//                                 <p style={{ color: '#8c7a60', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
//                                     No categories yet. Add one above.
//                                 </p>
//                             ) : (
//                                 categories.map(cat => (
//                                     <div key={cat._id} style={{
//                                         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                                         padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
//                                         background: '#faf8f5', border: '1px solid #e8e0d4'
//                                     }}>
//                                         <span style={{ color: '#3a3020', fontSize: '14px' }}>{cat.name}</span>
//                                         <button
//                                             className="icon-btn delete"
//                                             onClick={() => setConfirmDeleteCategory(cat._id)}
//                                             style={{ marginLeft: '8px' }}
//                                         >
//                                             <FaTrash />
//                                         </button>
//                                     </div>
//                                 ))
//                             )}
//                         </div>

//                         <div className="modal-actions" style={{ marginTop: '16px' }}>
//                             <button className="cancel-btn" onClick={() => setShowCategoryModal(false)}>Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Confirm Delete Category */}
//             {confirmDeleteCategory && (
//                 <div className="modal-overlay">
//                     <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
//                         <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
//                         <h3 style={{ marginBottom: '8px' }}>Delete Category?</h3>
//                         <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>
//                             Existing services with this category will not be affected.
//                         </p>
//                         <div className="modal-actions">
//                             <button onClick={() => handleDeleteCategory(confirmDeleteCategory)} style={{ background: '#e74c3c' }}>
//                                 Yes, Delete
//                             </button>
//                             <button className="cancel-btn" onClick={() => setConfirmDeleteCategory(null)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Confirm Delete Service */}
//             {confirmDelete && (
//                 <div className="modal-overlay">
//                     <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
//                         <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', marginBottom: '12px' }} />
//                         <h3>Delete Service?</h3>
//                         <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>This action cannot be undone.</p>
//                         <div className="modal-actions">
//                             <button onClick={confirmDeleteAction} style={{ background: '#e74c3c' }}>Yes, Delete</button>
//                             <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {toast.show && (
//                 <div className={`toast toast-${toast.type}`}>
//                     <span className="toast-icon">{toast.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}</span>
//                     <span className="toast-message">{toast.message}</span>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default ServicePricing;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowLeftEndOnRectangle } from "react-icons/hi2";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTags, FaCheckSquare, FaSquare } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
const API = "https://beautydelounge-backend.onrender.com";

function ServicePricing() {
    const navigate = useNavigate();
    let isAdmin = false;
    try {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            isAdmin = decoded.role === 'admin' || decoded.role === 'static-admin';
        }
    } catch (e) { }

    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", price: "" });
    const [priceError, setPriceError] = useState(""); 
    const [services, setServices] = useState([]);
    
    const [selectedItems, setSelectedItems] = useState([]);
    // NEW: Custom Bulk Delete Modal State
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);

    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const token = () => localStorage.getItem("token");

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetch(`${API}/api/services`, { headers: { "Authorization": `Bearer ${token()}` }})
            .then(res => res.json())
            .then(data => setServices(data));
            
        fetch(`${API}/api/categories?type=service`, { headers: { "Authorization": `Bearer ${token()}` }})
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []));
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await fetch(`${API}/api/upload`, { method: 'POST', headers: { "Authorization": `Bearer ${token()}` }, body: formData });
        const data = await res.json();
        return data.imageUrl;
    };

    const openAdd = () => {
        setForm({ name: "", category: "", price: "" });
        setPriceError("");
        setEditingItem(null);
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price) return showToast("Please fill in all fields.");
        if (Number(form.price) < 1) return showToast("Price must be at least ₱1.");
        
        setIsSaving(true);
        try {
            const imageUrl = await uploadImage();
            const finalForm = imageUrl ? { ...form, imageUrl } : form;
            const url = editingItem ? `${API}/api/services/${editingItem}` : `${API}/api/services`;
            const res = await fetch(url, {
                method: editingItem ? "PUT" : "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token()}` },
                body: JSON.stringify(finalForm)
            });

            if (res.ok) {
                const data = await res.json();
                setServices(editingItem ? services.map(s => s._id === editingItem ? data : s) : [...services, data]);
                setShowForm(false);
                showToast(editingItem ? "Updated!" : "Added!", "success");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (item) => {
        setForm(item);
        setPriceError("");
        setEditingItem(item._id);
        setImagePreview(item.imageUrl || '');
        setImageFile(null);
        setShowForm(true);
    };

    // --- CATEGORY MANAGEMENT LOGIC ---
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

    // --- BULK DELETE LOGIC ---
    const toggleSelect = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredServices.length) setSelectedItems([]);
        else setSelectedItems(filteredServices.map(item => item._id));
    };

    // UPGRADED: Executes the delete from the Custom Modal
    const executeBulkDelete = async () => {
        setIsSaving(true);
        try {
            await Promise.all(selectedItems.map(id => 
                fetch(`${API}/api/services/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token()}` }})
            ));
            setServices(services.filter(s => !selectedItems.includes(s._id)));
            setSelectedItems([]);
            setShowBulkDeleteModal(false); // Close Modal
            showToast(`Deleted services successfully.`, "success");
        } catch(e) {
            showToast("Failed to delete some services.");
        }
        setIsSaving(false);
    };

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
                    <p className="loading-text">SYNCING...</p>
                </div>
            )}
            <aside className="sidebar">
                <h2>BEA-UTY DE LOUNGE</h2>
                <nav>
                    <div className="nav-item" onClick={() => navigate("/dashboard")}><FaArrowLeft /> <span>Back</span></div>
                    <div className="nav-item logout" onClick={() => {localStorage.clear(); navigate("/");}}><HiArrowLeftEndOnRectangle /> <span>Logout</span></div>
                </nav>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Service Pricing</h1>
                    <p>Manage your services and prices</p>
                    <div className="filter-controls">
                        <div className="search-container">
                            <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                        </div>
                        <div className="category-filter">
                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
                                {filterOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <button className="add-btn" style={{ marginBottom: 0 }} onClick={openAdd}><FaPlus /> Add Service</button>
                    {isAdmin && (
                        <button className="add-btn" style={{ background: '#8c7a60', marginBottom: 0 }} onClick={() => setShowCategoryModal(true)}>
                            <FaTags /> Manage Categories
                        </button>
                    )}
                </div>

                {/* BULK ACTION BAR */}
                {selectedItems.length > 0 && (
                    <div className="bulk-action-bar">
                        <span style={{ color: '#c53030', fontWeight: 600 }}>{selectedItems.length} selected</span>
                        <button className="view-btn" onClick={() => setShowBulkDeleteModal(true)}><FaTrash style={{ marginRight: '6px' }}/> Delete Selected</button>
                    </div>
                )}

                <div style={{ marginBottom: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b5c45', fontSize: '14px', fontWeight: 500 }} onClick={toggleSelectAll}>
                    {selectedItems.length === filteredServices.length && filteredServices.length > 0 
                        ? <FaCheckSquare style={{ color: '#c9a84c', fontSize: '20px' }}/> 
                        : <FaSquare style={{ color: '#a89f91', fontSize: '20px' }}/>}
                    Select All
                </div>

                {/* Main Service Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>{editingItem ? "Edit Service" : "Add Service"}</h3>
                            <input placeholder="Service Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcd5c9' }}>
                                <option value="">— Select Category —</option>
                                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                            </select>

                            <div>
                                <input
                                    placeholder="Price (₱)"
                                    type="number"
                                    min="1"
                                    value={form.price}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setForm({ ...form, price: val });
                                        if (val !== "" && Number(val) < 1) setPriceError("Price must be at least ₱1.");
                                        else setPriceError("");
                                    }}
                                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    style={{ width: '100%', borderColor: priceError ? '#e74c3c' : '' }}
                                />
                                {priceError && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>{priceError}</span>}
                            </div>
                            
                            <div className="image-upload-box" onClick={() => document.getElementById('serviceImageInput').click()}>
                                {imagePreview ? <img src={imagePreview} alt="preview" className="image-preview" /> : <div className="image-upload-placeholder"><span>Click to add image</span></div>}
                            </div>
                            <input id="serviceImageInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                            
                            <div className="modal-actions">
                                <button onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Categories Modal */}
                {showCategoryModal && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: '420px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Manage Service Categories</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '20px', alignItems: 'stretch' }}>
                                <input
                                    placeholder="New category name..."
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #c9a84c', borderRadius: '8px', outline: 'none' }}
                                />
                                <button onClick={handleAddCategory} disabled={isSavingCategory} style={{ padding: '0 24px', borderRadius: '8px', border: 'none', background: '#c9a84c', color: '#ffffff', cursor: 'pointer', fontWeight: '600' }}>
                                    {isSavingCategory ? '...' : <><FaPlus /> Add</>}
                                </button>
                            </div>
                            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                                {categories.length === 0 ? (
                                    <p style={{ color: '#8c7a60', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No categories yet. Add one above.</p>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', marginBottom: '6px', background: '#faf8f5', border: '1px solid #e8e0d4' }}>
                                            <span style={{ color: '#3a3020', fontSize: '14px' }}>{cat.name}</span>
                                            <button className="icon-btn delete" onClick={() => setConfirmDeleteCategory(cat._id)} style={{ marginLeft: '8px' }}>
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
                            <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>Existing services with this category will not be affected.</p>
                            <div className="modal-actions">
                                <button onClick={() => handleDeleteCategory(confirmDeleteCategory)} style={{ background: '#e74c3c' }}>Yes, Delete</button>
                                <button className="cancel-btn" onClick={() => setConfirmDeleteCategory(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NEW: Custom Confirm Delete Bulk Modal */}
                {showBulkDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: '360px', textAlign: 'center' }}>
                            <FaTimesCircle style={{ fontSize: '40px', color: '#e74c3c', margin: '0 auto 12px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Delete {selectedItems.length} {selectedItems.length === 1 ? 'Service' : 'Services'}?</h3>
                            <p style={{ color: '#8c7a60', fontSize: '14px', marginBottom: '20px' }}>This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button onClick={executeBulkDelete} style={{ background: '#e74c3c' }}>Yes, Delete</button>
                                <button className="cancel-btn" onClick={() => setShowBulkDeleteModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="stocks-grid">
                    {filteredServices.length > 0 ? (
                        filteredServices.map(item => (
                            <div key={item._id} className={`stock-card ${selectedItems.includes(item._id) ? 'selected-card' : ''}`} style={{ position: 'relative' }}>
                                
                                <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, cursor: 'pointer' }} onClick={() => toggleSelect(item._id)}>
                                    {selectedItems.includes(item._id) 
                                        ? <FaCheckSquare style={{ color: '#c9a84c', fontSize: '22px', background: 'white', borderRadius: '4px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}/> 
                                        : <FaSquare style={{ color: '#ffffff', fontSize: '22px', opacity: 0.95, filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))', borderRadius: '4px' }}/>
                                    }
                                </div>

                                <div className="stock-card-image">
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="stock-no-image">✂️</div>}
                                </div>
                                <div className="stock-card-body">
                                    <h3 className="stock-card-name">{item.name}</h3>
                                    <p className="stock-card-category">{item.category}</p>
                                    <div className="stock-card-footer">
                                        <span className="stock-card-qty">₱{item.price}</span>
                                        <div className="stock-card-actions">
                                            <button className="icon-btn edit" onClick={() => openEdit(item)}><FaEdit /></button>
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