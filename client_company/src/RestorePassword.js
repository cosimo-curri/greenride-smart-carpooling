import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import "./styles/RestorePassword.css";

import utils from "./utils/utils";
import apiManager from "./utils/apiManager";

import Header from "./components/Header";
import HamburgerMenu from "./components/HamburgerMenu";
import Footer from "./components/Footer";

function RestorePassword(props) {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const changePasswordToken = searchParams.get("changePasswordToken");

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    
    useEffect(() => {
        document.body.style.overflow = hamburgerOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [hamburgerOpen]);

    const handleSubmitRestorePassword = async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const password1 = formData.get("password");
        const password2 = formData.get("password_confirm");

        if(
            !password1 ||
            !password2
        ) {
            props.showToast("All fields required", "error");
            return;
        }

        const checkPasswords = utils.checkPasswords(password1, password2);

        if(!checkPasswords.valid) {
            props.showToast(checkPasswords.message, "multiline");
            return;
        }

        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(apiManager.api.restorePassword, {
            changePasswordToken: changePasswordToken,
            password1: password1,
            password2: password2
        });

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "RESTORE_PASSWORD_COMPANY_ERROR":
                case "WEAK_PASSWORD":
                default:
                    props.showToast("An error occurred", "error");
                    break;
                
                case "RESTORE_PASSWORD_COMPANY_OK":
                    props.showToast("Password change successful", "success");
                    navigate("/");
                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    return (
        <>
            <Header
                setHamburgerOpen={ setHamburgerOpen }
                showToast={ props.showToast }
            />

            <main id="main-restore-password">
                {
                    hamburgerOpen &&
                    <HamburgerMenu
                        setHamburgerOpen={ setHamburgerOpen }
                        showToast={ props.showToast }
                    />
                }

                <form onSubmit={ handleSubmitRestorePassword }>
                    <label htmlFor="password">Password</label>
                    <div className="input-password-wrapper">
                        <input type={ showPassword ? "text" : "password" } id="password" name="password" />
                        <img className="img-input-password-wrapper" src={ showPassword ? "./images/eye_slash.svg" : "./images/eye.svg" } alt="See password" onClick={() => setShowPassword(!showPassword)} />
                    </div>

                    <label htmlFor="password_confirm">Confirm Password</label>
                    <div className="input-password-wrapper">
                        <input type={ showPasswordConfirm ? "text" : "password" } id="password_confirm" name="password_confirm" />
                        <img className="img-input-password-wrapper" src={ showPasswordConfirm ? "./images/eye_slash.svg" : "./images/eye.svg" } alt="See password" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} />
                    </div>

                    <button>Change Password</button>
                </form>
            </main>

            <Footer />
        </>
    );
}

export default RestorePassword;