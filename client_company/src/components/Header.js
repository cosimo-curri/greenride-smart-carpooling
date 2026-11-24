import { useAuth } from "../AuthContext";
import apiManager from "../utils/apiManager";

import NavLinks from "./NavLinks";

function Header(props) {
    const { company, loading } = useAuth();

    return (
        <header>
            <div className="box-logo" onClick={ () => window.scrollTo({ top: 0, behavior: "smooth" }) }>
                <img src={
                    !loading
                    ?
                    (
                        (company && company.isAdmin !== true)
                        ?
                        company.logoURL
                        :
                        "./images/logo.svg"
                    )
                    :
                    "./images/logo.svg"
                } alt="Logo" />

                <h3 style={{ color: !loading && company && company.isAdmin !== true ? "black" : undefined }}>
                    { !loading && company ? company.name : "GreenRide" }
                </h3>
            </div>

            <img src="./images/hamburger.svg" alt="Hamburger menu" id="hamburger-button" onClick={ () => props.setHamburgerOpen(true) } />

            <NavLinks
                setHamburgerOpen={ props.setHamburgerOpen }
                showToast={ props.showToast }
                pending={ props.pending }
                setPending={ props.setPending }
            />
        </header>
    );
}

export default Header;