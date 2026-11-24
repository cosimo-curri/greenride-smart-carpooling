import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

import apiManager from "../utils/apiManager";

function NavLinks(props) {
    const { company, loading, logout } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = (e, queryString) => {
        e.preventDefault();
        props.setHamburgerOpen(false);

        if(location.pathname === "/")
            document.querySelector(queryString)?.scrollIntoView({ behavior: "smooth" });
        else {
            sessionStorage.setItem("scrollToAnchor", queryString);
            navigate("/");
        }
    }

    const handleClickLogged = async (e, action) => {
        e.preventDefault();

        props.setHamburgerOpen(false);

        switch(action) {
            case "LOGOUT_ADMIN":
                props.showToast("Loading...", "loading");
                logout();
                
                break;
            
            case "PENDING_MANAGE":
                props.setPending(!props.pending);
                break;

            case "AUTH_2FA":
                break;
            
            case "PASSWORD":
                props.showToast("Loading...", "loading");

                const res = await apiManager.methods.post(apiManager.api.requestRestorePassword, {
                    email: company.email
                });

                if(res.success) {
                    const data = res.data;
                    
                    switch(data.message) {
                        case "RESTORE_PASSWORD_COMPANY_ERROR":
                        case "EMAIL_SEND_ERROR":
                        case "COMPANY_NOT_FOUND":
                        default:
                            props.showToast("An error occurred", "error");
                            break;

                        case "EMAIL_SEND_OK":
                            props.showToast("An e-mail has been sent to you, if you don't find it check your spam folder", "success");
                            break;
                    }
                } else
                    props.showToast("An error occurred", "error");
                
                break;

            case "LOGOUT":
                props.showToast("Loading...", "loading");

                const result = await apiManager.methods.get(apiManager.api.logout, {
                    companyid: company._id,
                    token: company.token
                });

                if(result.success) {
                    const data = result.data;

                    switch(data.message) {
                        case "COMPANY_ID_NOT_PROVIDED":
                        default:
                            props.showToast("An error occurred", "error");
                            break;

                        case "COMPANY_LOGOUT_OK":
                            props.showToast("Logout successfull", "success");
                            logout();

                            break;
                    }
                } else
                    props.showToast("An error occurred", "error");

                break;

            default:
                break;
        }
    }

    return (
        <nav>
            {
                !loading
                ?
                (
                    company
                    ?
                    (
                        company.isAdmin === true
                        ?
                        <ul className="header-logged">
                            <li><a href="/" onClick={ (e) => handleClickLogged(e, "LOGOUT_ADMIN") }>Logout</a></li>
                        </ul>
                        :
                        <ul className="header-logged">
                            <li><a style={{ fontWeight: "bold", textDecoration: "underline" }} href="/" onClick={ (e) => handleClickLogged(e, "PENDING_MANAGE") }>{ props.pending ? "Manage" : "Pending" }</a></li>
                            <li><a href="/" onClick={ (e) => handleClickLogged(e, "PASSWORD") }>Password</a></li>
                            <li><a href="/" onClick={ (e) => handleClickLogged(e, "LOGOUT") }>Logout</a></li>
                        </ul>
                    )
                    :
                    <ul>
                        <li>
                            <Link to="/" onClick={ () => {
                                props.setHamburgerOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}>
                                Home
                            </Link>
                        </li>

                        <li><a href="#box-forms" onClick={(e) => handleClick(e, "#box-forms")}>Join</a></li>
                        <li><a href="#box-why-choose" onClick={(e) => handleClick(e, "#box-why-choose")}>About</a></li>
                        <li><a href="#footer" onClick={(e) => handleClick(e, "footer")}>Contacts</a></li>
                    </ul>
                )
                :
                null
            }
        </nav>
    );
}

export default NavLinks;