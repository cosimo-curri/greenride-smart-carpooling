import { useState, useEffect } from "react";

import "./styles/PrivacyCookiePolicy.css";

import Header from "./components/Header";
import HamburgerMenu from "./components/HamburgerMenu";
import Footer from "./components/Footer";

function PrivacyCookiePolicy(props) {
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    
    useEffect(() => {
        document.body.style.overflow = hamburgerOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [hamburgerOpen]);

    return (
        <>
            <Header
                setHamburgerOpen={ setHamburgerOpen }
                showToast={ props.showToast }
            />

            <main id="main-privacy-cookie-policy">
                {
                    hamburgerOpen &&
                    <HamburgerMenu
                        setHamburgerOpen={ setHamburgerOpen }
                        showToast={ props.showToast }
                    />
                }

                <div id="box-info">
                    <h1>Legal Information</h1>
                    <p>Information Pursuant to Regulation (EU) 2016/679 (GDPR) - Article 6(1)(b) - on the Processing of Corporate Data and Use of Essential Cookies for the Carpooling Service.</p>
                </div>
                
                <div id="privacy-cookie-policy-container">
                    <div id="privacy-cookie-policy-info">
                        <img src="./images/contract.svg" alt="Legal information" />
                        <h2>Privacy & Cookie Policy</h2>
                    </div>
                    
                    <br />

                    <strong>Last Updated</strong>: 10/06/2025

                    <br />

                    <strong>Data Controller</strong>: GreenRide

                    <br />

                    <ol>
                        <li>
                            <strong>Purpose of Processing</strong>

                            <ul>
                                <li>Enable and manage the company's participation in the carpooling service</li>
                                <li>Accept or reject requests for access to the service</li>
                                <li>View anonymous statistics on participation and routes</li>
                            </ul>
                        </li>

                        <li>
                            <strong>Legal Basis</strong>

                            <ul>
                                <li>Performance of a contract (Art. 6(1)(b) GDPR)</li>
                                <li>Legal obligations related to tax/accounting matters</li>
                            </ul>
                        </li>

                        <li>
                            <strong>Cookies</strong>

                            <br />

                            <p>Our website uses HTTP cookies to improve and secure your experience. Below is the information on the essential (technical) cookies we use:</p>

                            <ul className="margin-ul">
                                <li>
                                    <strong>connect.sid</strong>: maintains your authenticated session for login; this cookie is a session cookie and expires when you close your browser
                                </li>

                                <li>
                                    <strong>csrf_token</strong>: protects against Cross-Site Request Forgery attacks; this is also a session cookie and expires at the end of your browsing session
                                </li>
                            </ul>

                            <p>These cookies are strictly necessary to provide you with the core functions of our Web Application and cannot be disabled without affecting the website's operation.</p>
                        </li>

                        <li>
                            <strong>Data Collected</strong>

                            <ul>
                                <li>Company name</li>
                                <li>VAT number</li>
                                <li>E-mail of the company contact person</li>
                                <li>Geographic coordinates of the physical office</li>
                                <li>Aggregated data on service usage</li>
                            </ul>
                        </li>

                        <li>
                            <strong>E-mail Communication</strong>

                            <p>We send e-mails related to the registration process and service management. These e-mails may contain personal data such as the VAT number or the location of the company you represent. The purposes of these communications include:</p>

                            <ul className="margin-ul">
                                <li>Confirming your registration and account activation</li>
                                <li>Providing important updates or notifications about the service</li>
                                <li>Responding to your requests or inquiries</li>
                            </ul>

                            <p>E-mails are sent based on the legal grounds of contract performance and/or your consent, where required. We implement appropriate technical and organizational measures to protect your personal data during e-mail communication.</p>
                        </li>

                        <li>
                            <strong>Data Recipients</strong>

                            <ul>
                                <li>No sharing of individual users'/employees' data</li>
                                <li>No access to individual data</li>
                            </ul>
                        </li>

                        <li>
                            <strong>Retention Period</strong>

                            <ul>
                                <li>2 years from termination of the agreement</li>
                            </ul>
                        </li>

                        <li>
                            <strong>Rights of the Data Controller (Company)</strong>

                            <ul>
                                <li>Access and rectification of company data</li>
                                <li>Restriction of processing in case of dispute</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div id="questions-about-box">
                    <h1>Questions About our Policies?</h1>
                    <p>If you have any questions about our Privacy Policy, please don't hesitate to contact us at the e-mail in the footer.</p>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default PrivacyCookiePolicy;