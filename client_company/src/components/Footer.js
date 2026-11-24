function Footer() {
    const contactEmail = process.env.REACT_APP_CONTACT_EMAIL || "contact@example.com";
    const handleClickPrivacyCookiePolicy = () => {
        if(window.location.pathname === "/privacy-cookie-policy")
            window.scrollTo({ top: 0, behavior: "smooth" });
        else
            window.open("/privacy-cookie-policy", "_blank", "noopener, noreferrer");
    }

    return (
        <footer id="footer">
            <div id="footer-content">
                <div id="footer-content-info">
                    <div onClick={ () => window.scrollTo({ top: 0, behavior: "smooth" }) }>
                        <img src="./images/logo.svg" alt="Logo" />
                        <h3>GreenRide</h3>
                    </div>

                    <p>This site uses essential cookies to keep you logged in.<br />See our <span className="footer-link" onClick={ handleClickPrivacyCookiePolicy }>Privacy & Cookie Policy</span> for full details.</p>
                </div>

                <div id="footer-content-contacts">
                    <h4>Contacts</h4>

                    <ul>
                        <li>
                            <img src="./images/email.svg" alt="E-mail" />
                            <a href={ `mailto:${contactEmail}` }>{ contactEmail }</a>
                        </li>
                    </ul>
                </div>
            </div>

            <hr />

            <p>© 2025 GreenRide. All rights reserved.</p>
        </footer>
    );
}

export default Footer;