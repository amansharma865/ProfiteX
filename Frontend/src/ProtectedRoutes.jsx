import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader'; // Import the loader

const ProtectedRoute = ({ requiredRole }) => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/getRole`, {
                    withCredentials: true,
                });
                setUserRole(response.data.role);
            } catch (error) {
                console.error('Error fetching role:', error);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ClipLoader color="#4A90E2" size={60} />
            </div>
        ); // Centered loader with custom color and size
    }

    if (!userRole || userRole !== requiredRole) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
