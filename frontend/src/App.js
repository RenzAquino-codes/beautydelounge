import Login from "./pages/Login.jsx";
import Register from "./pages/register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Stocks from './pages/Stocks.jsx';
import ServicePricing from './pages/ServicePricing.jsx';
import TransactionHistory from './pages/TransactionHistory.jsx';
import Analytics from './pages/Analytics.jsx';
import Profile from './pages/Profile.jsx';

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 

function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token"); 
    if (!token) return <Navigate to="/" />; 
    if (user?.role !== 'admin' && user?.role !== 'static-admin') return <Navigate to="/dashboard" />; 
    return children;
}

function App() {
    return (
        <Router>
            <Routes>
                {/*Default Page*/}
                <Route path="/" element={<Login />} />

                {/*Register Page*/}
                <Route path="/register" element={<Register />} />

                {/*Dashboard page*/}
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/dashboard/stocks" element={<Stocks />} />
                <Route path="/dashboard/service-pricing" element={<ServicePricing />} />
                <Route path="/dashboard/transactions" element={<TransactionHistory />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                {/*  Analytics is now protected — staff gets redirected */}
                <Route path="/dashboard/analytics" element={
                    <AdminRoute>
                        <Analytics />
                    </AdminRoute>
                } />

            </Routes>
        </Router>
    );
}

export default App;