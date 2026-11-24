import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

import utils from "./utils/utils";
import apiManager from "./utils/apiManager";

import "./styles/Home.css";

import { useConfirmDialog } from "./utils/useConfirmDialog";

import Header from "./components/Header";
import WhyChooseCard from "./components/WhyChooseCard";
import Footer from "./components/Footer";
import HamburgerMenu from "./components/HamburgerMenu";
import FileDropzone from "./components/FileDropZone";

function Home(props) {
    const { company, signin, loading } = useAuth();

    const navigate = useNavigate();

    const fileDropzoneRef = useRef();

    const [showConfirmDialog, confirmDialogElement] = useConfirmDialog();

    const [searchParams] = useSearchParams();
    const signupstatus = searchParams.get("signupstatus");

    const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);
    const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
    const [showPasswordConfirmSignUp, setShowPasswordConfirmSignUp] = useState(false);

    const [hamburgerOpen, setHamburgerOpen] = useState(false);

    const [signupstatusSeen, setSignupStatusSeen] = useState(false);

    ///////////////////////////////////////
    /// STATE VARIABLES FOR THE SIGN-UP ///
    ///////////////////////////////////////

    const [VAT, setVAT] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [selectedLogo, setSelectedLogo] = useState(null);
    const [logoFilename, setLogoFilename] = useState(null);

    ///////////////////////////////////////
    /// STATE VARIABLES FOR THE SIGN-IN ///
    ///////////////////////////////////////

    const [email, setEmail] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        if(!loading && company)
            navigate("/profile");
        
        const emailSaved = localStorage.getItem("email");

        if(emailSaved) {
            setEmail(emailSaved);
            setRememberMe(true);
        }

        const anchor = sessionStorage.getItem("scrollToAnchor");

        if(anchor) {
            const element = document.querySelector(anchor);

            if(element)
                element.scrollIntoView({ behavior: "smooth" });

            sessionStorage.removeItem("scrollToAnchor");
        }

        if(signupstatus && signupstatus === "ok" && !signupstatusSeen) {
            document.getElementById("box-forms").scrollIntoView({ behavior: "smooth" });
            props.showToast("You have successfully activated your account, now wait for our confirmation by e-mail", "success");
            setSignupStatusSeen(true);
        }
    }, [company, loading, signupstatus, signupstatusSeen, props, navigate]);
    
    useEffect(() => {
        document.body.style.overflow = hamburgerOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [hamburgerOpen]);

    const handleClickPrivacyCookiePolicy = () => {
        window.open("/privacy-cookie-policy", "_blank", "noopener, noreferrer");
    }

    const handleChangeVAT = (e) => {
        const input = e.target.value;
        const onlyNumber = input.replace(/\D/g, "");
        setVAT(onlyNumber.slice(0, 11));
    }

    const handleChangeLatitude = (e) => {
        const value = utils.formatCoordinates(e.target.value, "latitude");
        setLatitude(value);
    }

    const handleChangeLongitude = (e) => {
        const value = utils.formatCoordinates(e.target.value, "longitude");
        setLongitude(value);
    }

    const handleSubmitSignIn = async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const email = formData.get("email_signin");
        const password = formData.get("password_signin");

        if(
            !email ||
            !password
        ) {
            props.showToast("All fields required", "error");
            return;
        }

        if(!utils.isValidEmail(email)) {
            props.showToast("Invalid e-mail address", "error");
            return;
        }

        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(apiManager.api.signin, {
            email: email,
            password: password
        });

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "COMPANY_SIGNIN_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    break;
                
                case "COMPANY_SIGNIN_NOT_FOUND":
                    props.showToast("Authentication error", "error");
                    break;
                
                case "COMPANY_SIGNIN_NOT_ACTIVE":
                    props.showToast("The company has not yet been activated", "error");
                    form.reset();
                    setEmail("");
                    setRememberMe(false);
                    break;
                
                case "COMPANY_SIGNIN_OK":
                case "ADMIN_SIGNIN_OK":
                    if(formData.has("remember_me"))
                        localStorage.setItem("email", email);
                    else
                        localStorage.removeItem("email");

                    data.company.token = data.token;
                    signin(data.company);

                    if(data.message === "COMPANY_SIGNIN_OK")
                        props.showToast("Sign-in successfull", "success");
                    else
                        props.showToast("Admin sign-in successfull", "success");

                    navigate("/profile");
                    
                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const handleForgotPassword = async () => {
        if(!email) {
            props.showToast("E-mail required", "error");
            return;
        }

        if(!utils.isValidEmail(email)) {
            props.showToast("Invalid e-mail address", "error");
            return;
        }

        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(apiManager.api.requestRestorePassword, {
            email: email
        });

        if(result.success) {
            const data = result.data;
            
            switch(data.message) {
                case "RESTORE_PASSWORD_COMPANY_ERROR":
                case "EMAIL_SEND_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    break;
                
                case "COMPANY_NOT_FOUND":
                    props.showToast("E-mail not found", "error");
                    break;

                case "EMAIL_SEND_OK":
                    setEmail("");
                    props.showToast("An e-mail has been sent to you, if you don't find it check your spam folder", "success");
                    document.getElementById("box-forms").scrollIntoView({ behavior: "smooth" });

                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const handleSubmitSignUp = async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);

        const companyName = formData.get("company_name_signup");
        const VAT_number = formData.get("VAT_number_signup");
        const email = formData.get("email_signup");
        const password = formData.get("password_signup");
        const passwordConfirm = formData.get("password_confirm_signup");
        const latitude = formData.get("latitude_signup");
        const longitude = formData.get("longitude_signup");

        if(
            !companyName ||
            !VAT_number ||
            !email ||
            !password ||
            !passwordConfirm ||
            !latitude ||
            !longitude ||
            !selectedLogo ||
            !logoFilename
        ) {
            props.showToast("All fields required", "error");
            return;
        }

        if(VAT_number.length !== 11) {
            props.showToast("The VAT Number has to be 11 characters long", "error");
            return;
        }

        if(!utils.isValidEmail(email)) {
            props.showToast("Invalid e-mail address", "error");
            return;
        }

        const checkPasswords = utils.checkPasswords(password, passwordConfirm);

        if(!checkPasswords.valid) {
            props.showToast(checkPasswords.message, "multiline");
            return;
        }

        const checkCoordinates = utils.checkCoordinates(latitude, longitude);

        if(!checkCoordinates.valid) {
            props.showToast(checkCoordinates.message, "multiline");
            return;
        }

        if(!formData.has("agree_terms")) {
            props.showToast("It's not possible to sign-up without accepting our Privacy & Cookie Policy", "error");
            return;
        }

        const resultConfirmDialog = await showConfirmDialog("Are you sure you entered the information correctly? Your account will need to be approved and you will not be able to change the information for security reasons.");

        if(resultConfirmDialog.confirmed) {
            props.showToast("Loading...", "loading");

            const result = await apiManager.methods.post(apiManager.api.signup, {
                name: companyName,
                VAT: VAT_number,
                email: email,
                password: password,
                headquartersCoordinates: {
                    type: "Point",
                    coordinates: [longitude, latitude] //LONGITUDE FIRST
                },
                logoFilename: logoFilename
            });

            if(result.success) {
                const data = result.data;

                switch(data.message) {
                    case "NOT_AN_EMAIL":
                    case "WEAK_PASSWORD":
                    case "COORDINATES_ERROR":
                    case "EMAIL_SEND_ERROR":
                    case "COMPANY_SIGNUP_ERROR":
                    case "ValidationError":
                    default:
                        props.showToast("An error occurred", "error");
                        break;

                    case "MongoServerError":
                        props.showToast("Someone has already registered your company", "error");
                        break;

                    case "UserExistsError":
                        props.showToast("E-mail address already used", "error");
                        break;
                    
                    case "EMAIL_SEND_OK":
                        form.reset();
                        setVAT("");
                        setLatitude("");
                        setLongitude("");
                        setSelectedLogo(null);
                        setLogoFilename(null);
                        resetFileDropzone();
                        
                        props.showToast("The confirmation e-mail has been sent, if you don't find it check your spam folder", "success");
                        
                        document.getElementById("box-forms").scrollIntoView({ behavior: "smooth" });
                        break;
                }
            } else
                props.showToast("An error occurred", "error");
        }
    }

    const handleSvgFile = async (file) => {
        setSelectedLogo(file);
        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.uploadFiles(apiManager.api.uploadLogo, [file]);

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "MORE_FILE_ERROR":
                case "EXT_NOT_SUPPORTED":
                case "MIME_TYPE_NOT_SUPPORTED":
                case "UPLOAD_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    break;
                
                case "UPLOAD_OK":
                    props.showToast("File successfully uploaded", "file");
                    setLogoFilename(data.filename);
                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const resetFileDropzone = () => {
        fileDropzoneRef.current?.reset();
    }
    
    const handleChangeEmail = (e) => {
        setEmail(e.target.value);
    }

    const handleChangeRememberMe = (e) => {
        setRememberMe(e.target.checked);
    }
    
    return (
        <>
            <Header
                setHamburgerOpen={ setHamburgerOpen }
                showToast={ props.showToast }
            />

            <main id="main-home">
                {
                    hamburgerOpen &&
                    <HamburgerMenu
                        setHamburgerOpen={ setHamburgerOpen }
                        showToast={ props.showToast }
                    />
                }
                
                <div id="box-presentation">
                    <h1>Smart Carpooling for a Greener Future</h1>
                    <p>Step into the future by empowering your employees to carpool - together, let's drive a greener planet.</p>
                </div>

                <div id="box-forms">
                    <form onSubmit={ handleSubmitSignIn }>
                        <div className="form-info">
                            <img src="./images/sign_in.svg" alt="Sign-in" />
                            <h3>Welcome Back</h3>
                            <p>Access your company's control panel.</p>
                        </div>

                        <label htmlFor="email_signin">E-mail Address</label>
                        <input
                            type="text"
                            id="email_signin"
                            name="email_signin"
                            value={ email }
                            onChange={ handleChangeEmail }
                        />

                        <label htmlFor="password_signin">Password</label>
                        <div className="input-password-wrapper">
                            <input type={ showPasswordSignIn ? "text" : "password" } id="password_signin" name="password_signin" />
                            <img className="img-input-password-wrapper" src={ showPasswordSignIn ? "./images/eye_slash.svg" : "./images/eye.svg" } alt="See password" onClick={() => setShowPasswordSignIn(!showPasswordSignIn)} />
                        </div>
                        
                        <div id="remember-me-container">
                            <input
                                type="checkbox"
                                id="remember-me"
                                name="remember_me"
                                checked={ rememberMe }
                                onChange={ handleChangeRememberMe }
                            />
                            <label htmlFor="remember-me">Remember me</label>
                        </div>

                        <p id="password-forgot" onClick={ handleForgotPassword }>Forgot password?</p>

                        <button>Sign-in</button>
                    </form>

                    <form onSubmit={ handleSubmitSignUp }>
                        <div className="form-info">
                            <img src="./images/sign_up.svg" alt="Sign-up" />
                            <h3>Join Us</h3>
                            <p>Register the specific location.</p>
                        </div>

                        <label htmlFor="company_name_signup">Company Name</label>
                        <input type="text" id="company_name_signup" name="company_name_signup" />

                        <label htmlFor="vat_number_signup">VAT Number</label>
                        <input
                            type="text"
                            id="vat_number_signup"
                            placeholder="07560931003"
                            maxLength={ 11 }
                            inputMode="numeric"
                            value={ VAT }
                            onChange={ handleChangeVAT }
                            name="VAT_number_signup"
                        />

                        <label htmlFor="email_signup">E-mail Address</label>
                        <input type="text" id="email_signup" name="email_signup" />

                        <div id="password-signup-container">
                            <div>
                                <label htmlFor="password_signup">Password</label>
                                <div className="input-password-wrapper">
                                    <input type={ showPasswordSignUp ? "text" : "password" } id="password_signup" name="password_signup" />
                                    <img className="img-input-password-wrapper" src={ showPasswordSignUp ? "./images/eye_slash.svg" : "./images/eye.svg" } alt="See password" onClick={ () => setShowPasswordSignUp(!showPasswordSignUp) } />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password_confirm_signup">Confirm Password</label>
                                <div className="input-password-wrapper">
                                    <input type={ showPasswordConfirmSignUp ? "text" : "password" } id="password_confirm_signup" name="password_confirm_signup" />
                                    <img className="img-input-password-wrapper" src={ showPasswordConfirmSignUp ? "./images/eye_slash.svg" : "./images/eye.svg" } alt="See password" onClick={ () => setShowPasswordConfirmSignUp(!showPasswordConfirmSignUp) } />
                                </div>
                            </div>
                        </div>

                        <FileDropzone
                            ref={ fileDropzoneRef }
                            accept=".svg"
                            label="Drag .svg logo here or click to select"
                            onFileSelect={ handleSvgFile }
                            showToast={ props.showToast }
                            moreFiles={ false }
                        />

                        <div id="headquarters-coordinates-container">
                            <div>
                                <label htmlFor="latitude">Latitude</label>
                                <input
                                    type="text"
                                    id="latitude"
                                    placeholder="40.5158"
                                    value={ latitude }
                                    onChange={ handleChangeLatitude }
                                    name="latitude_signup"
                                />
                            </div>

                            <div>
                                <label htmlFor="longitude">Longitude</label>
                                <input
                                    type="text"
                                    id="longitude"
                                    placeholder="17.2514"
                                    value={ longitude }
                                    onChange={ handleChangeLongitude }
                                    name="longitude_signup"
                                />
                            </div>
                        </div>

                        <div id="agree-terms-container">
                            <input type="checkbox" id="agree-terms" name="agree_terms" />
                            <label>I agree to the <p className="link" onClick={ handleClickPrivacyCookiePolicy }>Privacy & Cookie Policy</p></label>
                        </div>

                        <button>Sign-up</button>
                    </form>
                </div>

                <div id="box-why-choose">
                    <h1>Why Choose GreenRide?</h1>
                    <p>Sustainable transportation made easy for your company's employees.</p>

                    <div id="why-choose-cards-container">
                        <WhyChooseCard
                            image="./images/eco.svg"
                            title="Eco-Friendly"
                            description="Reduce your carbon footprint with our sustainable transportation solutions."
                        />

                        <WhyChooseCard
                            image="./images/clock.svg"
                            title="Reliable"
                            description="Count on us for punctual and dependable service every time."
                        />

                        <WhyChooseCard
                            image="./images/euro.svg"
                            title="Affordable"
                            description="Free price without affecting the quality of the service."
                        />
                    </div>
                </div>

                { confirmDialogElement }
            </main>

            <Footer />
        </>
    );
}

export default Home;