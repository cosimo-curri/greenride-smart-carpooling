import { Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { AuthProvider } from "./AuthContext";

import Error from "./Error";
import Home from "./Home";
import PrivacyCookiePolicy from "./PrivacyCookiePolicy";
import Profile from "./Profile";
import RestorePassword from "./RestorePassword";

function App() {
    const showToast = (text, type) => {
        const style = {
            fontFamily: 'ui-rounded, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            boxShadow: "0 0 8px rgba(0, 0, 0, 0.25)"
        };

        if(type === "multiline") {
            toast(text, {
                style: style
            });
        } else {
            const dictionary = {
                success: "🌿",
                loading: "⌛",
                file: "🗂️",
                error: "❌"
            };

            toast(text, {
                icon: dictionary[type],
                style: style
            });
        }
    }

    return (
        <>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={ <Home showToast={ showToast } /> } />
                    <Route path="/privacy-cookie-policy" element={ <PrivacyCookiePolicy showToast={ showToast } /> } />
                    <Route path="/profile" element={ <Profile showToast={ showToast } /> } />
                    <Route path="/restore-password" element={ <RestorePassword showToast={ showToast } /> } />
                    <Route path="/error" element={ <Error /> } />
                    <Route path="*" element={ <Error /> } />
                </Routes>
            </AuthProvider>

            <Toaster
                position="bottom-right"
                reverseOrder={ false }
            />
        </>
    );
}

export default App;