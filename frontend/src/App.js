import Login from "./pages/Login.jsx";
// import Register from "./pages/register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Stocks from './pages/Stocks.jsx';
import ServicePricing from './pages/ServicePricing.jsx';
import TransactionHistory from './pages/TransactionHistory.jsx';
import Analytics from './pages/Analytics.jsx';
import Profile from './pages/Profile.jsx';
import ManageUsers from './pages/ManageUsers';



import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function AdminRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/" />;

    try {
        // Decode the token to see what the SERVER says the role is
        const decodedToken = jwtDecode(token);
        
        // If the token expires or they aren't an admin, kick them out
        if (decodedToken.exp * 1000 < Date.now() || 
           (decodedToken.role !== 'admin' && decodedToken.role !== 'static-admin')) {
            return <Navigate to="/dashboard" />;
        }
    } catch (error) {
        // If the token is fake or tampered with, kick them out
        localStorage.clear();
        return <Navigate to="/" />;
    }

    return children;
}
function App() {
    return (
        <Router>
            <Routes>
                {/*Default Page*/}
                <Route path="/" element={<Login />} />

                {/*Register Page*/}
                {/* <Route path="/register" element={<Register />} /> */}

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


                <Route path="/dashboard/manage-users" element={
                    <AdminRoute>
                        <ManageUsers />
                    </AdminRoute>
                } />





            </Routes>
        </Router>
    );
}

export default App;