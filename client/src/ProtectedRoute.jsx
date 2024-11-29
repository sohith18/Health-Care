import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const authToken = localStorage.getItem('AuthToken');
                if (!authToken) {
                    setLoading(false);
                    return;
                }

                const response = await fetch("http://localhost:3000/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                    },
                });

                const data = await response.json();
                if (response.status === 200) {
                    setUser(data.user);
                } else {
                    console.error("Error fetching user data:", data);
                    // Handle cases where user data is invalid or not found
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    
    if (user && !allowedRoles.includes(user.role)) {
        console.log(user.role);
        return <Navigate to="/Unauthorised" />;
    }

    return children;
}

