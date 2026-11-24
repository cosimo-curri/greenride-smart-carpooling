import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedCompany = localStorage.getItem("company");

        if(storedCompany)
            setCompany(JSON.parse(storedCompany));

        setLoading(false);
    }, []);

    const signin = (companyData) => {
        setCompany(companyData);
        localStorage.setItem("company", JSON.stringify(companyData));
    };

    const logout = () => {
        setCompany(null);
        localStorage.removeItem("company");
    };

    return (
        <AuthContext.Provider value={{ company, signin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);