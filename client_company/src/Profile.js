import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import "./styles/Profile.css";

import { useConfirmDialog } from "./utils/useConfirmDialog";

import apiManager from "./utils/apiManager";

import Header from "./components/Header";
import HamburgerMenu from "./components/HamburgerMenu";
import Footer from "./components/Footer";
import FileDropzone from "./components/FileDropZone";

function Profile(props) {
    const { company, loading, logout } = useAuth();

    const navigate = useNavigate();

    const fileDropzoneRef = useRef();

    const [showConfirmDialog, confirmDialogElement] = useConfirmDialog();

    const [hamburgerOpen, setHamburgerOpen] = useState(false);

    /////////////
    /// ADMIN ///
    /////////////

    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [pendingEmployees, setPendingEmployees] = useState([]);
    
    ///////////////
    /// COMPANY ///
    ///////////////

    const [pending, setPending] = useState(true);
    const [employees, setEmployees] = useState([]);

    const [showFileDropzone, setShowFileDropzone] = useState(false);
    const [filesUploaded, setFilesUploaded] = useState([]);
    
    useEffect(() => {
        if(!loading && !company)
            navigate("/");

        const asyncFunction = async () => {
            if(!loading && company) {
                props.showToast("Loading...", "loading");

                if(company.isAdmin === true) {
                    const result = await apiManager.methods.get(apiManager.tokenApi.getAllPendingSignUpRequests, {
                        token: company.token
                    });

                    if(result.success) {
                        const data = result.data;

                        switch(data.message) {
                            case "TOKEN_COMPANY_NOT_PROVIDED":
                            case "CANNOT_VERIFY_TOKEN_COMPANY":
                            case "NOT_ADMIN":
                            case "GET_ALL_PENDING_SIGN_UP_REQUESTS_COMPANY_ERROR":
                            default:
                                props.showToast("An error occurred", "error");
                                logout();

                                break;
                            
                            case "GET_ALL_PENDING_SIGN_UP_REQUESTS_COMPANY_OK":
                                props.showToast("Lists of pending registration requests from companies successfully loaded", "success");
                                setPendingCompanies(data.companies);
                                break;
                        }
                    } else
                        props.showToast("An error occurred", "error");
                } else {
                    const result = await apiManager.methods.get(apiManager.tokenApi.getAllPendingEmployeesSignUp, {
                        token: company.token,
                        companyid: company._id
                    });

                    if(result.success) {
                        const data = result.data;

                        switch(data.message) {
                            case "TOKEN_COMPANY_NOT_PROVIDED":
                            case "CANNOT_VERIFY_TOKEN_COMPANY":
                            case "GET_ALL_PENDING_EMPLOYEES_SIGNUP_ERROR":
                            default:
                                props.showToast("An error occurred", "error");
                                logout();

                                break;
                            
                            case "GET_ALL_PENDING_EMPLOYEES_SIGNUP_OK":
                                props.showToast("Lists of pending registration requests from employees successfully loaded", "success");
                                setPendingEmployees(data.pendingEmployees);
                                break;
                        }
                    } else
                        props.showToast("An error occurred", "error");

                    const resultManage = await apiManager.methods.get(apiManager.tokenApi.getAllCompanyEmployees, {
                        token: company.token,
                        companyid: company._id
                    });

                    let employeesFromApi = [];

                    if(resultManage.success) {
                        const data = resultManage.data;

                        switch(data.message) {
                            case "TOKEN_COMPANY_NOT_PROVIDED":
                            case "CANNOT_VERIFY_TOKEN_COMPANY":
                            case "GET_ALL_COMPANY_EMPLOYEES_ERROR":
                            default:
                                props.showToast("An error occurred", "error");
                                logout();

                                break;
                            
                            case "GET_ALL_COMPANY_EMPLOYEES_OK":
                                props.showToast("Lists of all registered employees successfully loaded", "success");
                                employeesFromApi = data.employees;
                                break;
                        }
                    } else
                        props.showToast("An error occurred", "error");
                    
                    const resultSelfcertifications = await apiManager.methods.get(apiManager.tokenApi.getAllPendingSelfcertification, {
                        token: company.token,
                        companyid: company._id
                    });

                    if(resultSelfcertifications.success) {
                        const data = resultSelfcertifications.data;

                        switch(data.message) {
                            case "TOKEN_COMPANY_NOT_PROVIDED":
                            case "CANNOT_VERIFY_TOKEN_COMPANY":
                            case "GET_ALL_PENDING_SELFCERTIFICATIONS_ERROR":
                            default:
                                props.showToast("An error occurred", "error");
                                logout();

                                break;
                            
                            case "GET_ALL_PENDING_SELFCERTIFICATIONS_OK":
                                props.showToast("Lists of all pending self-certifications successfully loaded", "success");

                                const selfcertifications = data.pendingSelfcertification;

                                const enrichedEmployees = employeesFromApi.map(emp => {
                                    const employeeSelfcerts = selfcertifications
                                        .filter(cert => cert.employee._id === emp._id)
                                        .map(cert => {
                                            const { employee, ...rest } = cert;
                                            return rest;
                                        });

                                    return {
                                        ...emp,
                                        pendingSelfcertifications: employeeSelfcerts
                                    };
                                });

                                const sortedEmployees = enrichedEmployees.sort((a, b) => {
                                    if(b.greenPoints !== a.greenPoints)
                                        return b.greenPoints - a.greenPoints;

                                    return a.username.localeCompare(b.username);
                                });

                                setEmployees(sortedEmployees);

                                break;
                        }
                    } else
                        props.showToast("An error occurred", "error");
                }
            }
        };

        asyncFunction();
    }, [company, loading, navigate, props, logout]);

    useEffect(() => {
        document.body.style.overflow = hamburgerOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [hamburgerOpen]);

    const handleAcceptCompany = async (companyId) => {
        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(
            apiManager.tokenApi.acceptCompany,
            { companyId: companyId },
            { token: company.token }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_COMPANY_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_COMPANY":
                case "NOT_ADMIN":
                case "ACCEPT_COMPANY_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    logout();

                    break;
                
                case "ACCEPT_COMPANY_OK":
                    setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
                    props.showToast("Company successfully accepted", "success");

                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const handleRejectCompany = async (companyId) => {
        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.del(
            apiManager.tokenApi.rejectCompany,
            { companyId: companyId },
            { token: company.token }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_COMPANY_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_COMPANY":
                case "NOT_ADMIN":
                case "REJECT_COMPANY_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    logout();

                    break;
                
                case "REJECT_COMPANY_OK":
                    setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
                    props.showToast("", "success");
                    
                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const handleAcceptEmployee = async (employeeId) => {
        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(
            apiManager.tokenApi.acceptEmployee,
            { employeeId: employeeId },
            { token: company.token }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_COMPANY_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_COMPANY":
                case "ACCEPT_EMPLOYEE_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    logout();

                    break;
                
                case "ACCEPT_EMPLOYEE_OK":
                    setPendingEmployees(prev => prev.filter(e => e._id !== employeeId));

                    setEmployees(prev => {
                        const newEmployee = {
                            ...data.employee,
                            pendingSelfcertifications: []
                        };

                        const updated = [newEmployee, ...prev];
                        
                        return updated.sort((a, b) => {
                            if(b.greenPoints !== a.greenPoints)
                                return b.greenPoints - a.greenPoints;

                            return a.username.localeCompare(b.username);
                        });
                    });

                    props.showToast("Employee successfully accepted", "success");

                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const handleRejectEmployee = async (employeeId) => {
        const resultConfirmDialog = await showConfirmDialog("Are you sure you want to reject the employee? This action is irreversible.");

        if(resultConfirmDialog.confirmed) {
            props.showToast("Loading...", "loading");

            const result = await apiManager.methods.post(
                apiManager.tokenApi.rejectEmployee,
                { employeeId: employeeId },
                { token: company.token }
            );

            if(result.success) {
                const data = result.data;

                switch(data.message) {
                    case "TOKEN_COMPANY_NOT_PROVIDED":
                    case "CANNOT_VERIFY_TOKEN_COMPANY":
                    case "REJECT_EMPLOYEE_ERROR":
                    default:
                        props.showToast("An error occurred", "error");
                        logout();

                        break;
                    
                    case "REJECT_EMPLOYEE_OK":
                        setPendingEmployees(prev => prev.filter(e => e._id !== employeeId));
                        setEmployees(prev => prev.filter(e => e._id !== employeeId));
                        props.showToast("Employee successfully rejected", "success");

                        break;
                }
            } else
                props.showToast("An error occurred", "error");
        }
    }

    const handleClickFile = async (e, employeeid, documentURL) => {
        e.preventDefault();

        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.downloadProtectedFile(
            documentURL,
            {
                token: company.token,
                employeeid: employeeid
            }
        );

        if(!result.success) {
            props.showToast("An error occurred", "error");
            logout();
        }
    }

    const handleAcceptSelfcertification = async (employeeId, selfcertificationId) => {
        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(
            apiManager.tokenApi.acceptSelfcertification,
            { selfcertificationId: selfcertificationId },
            { token: company.token }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_COMPANY_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_COMPANY":
                case "ACCEPT_SELFCERTIFICATION_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    logout();

                    break;
                
                case "ACCEPT_SELFCERTIFICATION_OK":
                    setEmployees(prevEmployees =>
                        prevEmployees.map(emp => ({
                            ...emp,
                            pendingSelfcertifications: emp.pendingSelfcertifications.filter(cert => cert._id !== selfcertificationId)
                        }))
                    );

                    setEmployees(prevEmployees => {
                        const updated = prevEmployees.map(emp => {
                            if(emp._id === employeeId) {
                                const updatedSelfcerts = emp.pendingSelfcertifications.filter(cert => cert._id !== selfcertificationId);

                                return {
                                    ...emp,
                                    greenPoints: data.updatedGreenPoints,
                                    pendingSelfcertifications: updatedSelfcerts
                                };
                            }
                            return emp;
                        });

                        return updated.sort((a, b) => {
                            if(b.greenPoints !== a.greenPoints)
                                return b.greenPoints - a.greenPoints;

                            return a.username.localeCompare(b.username);
                        });
                    });

                    props.showToast("Self-certification successfully accepted", "success");

                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const handleRejectSelfcertification = async (employeeId, selfcertificationId) => {
        props.showToast("Loading...", "loading");

        const result = await apiManager.methods.post(
            apiManager.tokenApi.rejectSelfcertification,
            { selfcertificationId: selfcertificationId },
            { token: company.token }
        );

        if(result.success) {
            const data = result.data;

            switch(data.message) {
                case "TOKEN_COMPANY_NOT_PROVIDED":
                case "CANNOT_VERIFY_TOKEN_COMPANY":
                case "REJECT_SELFCERTIFICATION_ERROR":
                default:
                    props.showToast("An error occurred", "error");
                    logout();

                    break;
                
                case "REJECT_SELFCERTIFICATION_OK":
                    setEmployees(prevEmployees =>
                        prevEmployees.map(emp => ({
                            ...emp,
                            pendingSelfcertifications: emp.pendingSelfcertifications.filter(cert => cert._id !== selfcertificationId)
                        }))
                    );

                    setEmployees(prevEmployees => {
                        const updated = prevEmployees.map(emp => {
                            if(emp._id === employeeId) {
                                const updatedSelfcerts = emp.pendingSelfcertifications.filter(cert => cert._id !== selfcertificationId);

                                return {
                                    ...emp,
                                    greenPoints: data.updatedGreenPoints,
                                    pendingSelfcertifications: updatedSelfcerts
                                };
                            }
                            return emp;
                        });

                        return updated.sort((a, b) => {
                            if(b.greenPoints !== a.greenPoints)
                                return b.greenPoints - a.greenPoints;
                            
                            return a.username.localeCompare(b.username);
                        });
                    });

                    props.showToast("Self-certification successfully rejected", "success");

                    break;
            }
        } else
            props.showToast("An error occurred", "error");
    }

    const resetFileDropzone = () => {
        fileDropzoneRef.current?.reset();
    }

    const handleCancelFilesUpload = () => {
        setShowFileDropzone(false);
        setFilesUploaded([]);
        resetFileDropzone();
    }

    const handleFilesUpload = (file) => {
        if(filesUploaded.length !== 3) {
            setFilesUploaded(prevFiles => [...prevFiles, file]);
        } else
            props.showToast("You can't upload more files", "error");
    }

    const handleSendGifts = async () => {
        if(filesUploaded.length === 3) {
            props.showToast("Loading...", "loading");

            const result = await apiManager.methods.uploadFiles(apiManager.api.uploadGifts, filesUploaded, {
                first_place_employee_id: employees[0]._id,
                second_place_employee_id: employees[1]._id,
                third_place_employee_id: employees[2]._id,
                token: company.token
            });

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
                        props.showToast("Gifts successfully sent", "success");

                        setEmployees(employees.map(employee => ({
                            ...employee,
                            greenPoints: 0
                        })));

                        handleCancelFilesUpload();

                        break;
                }
            } else
                props.showToast("An error occurred", "error");
        } else
            props.showToast("You haven't uploaded all the files", "error");
    }

    return (
        <>
            <Header
                setHamburgerOpen={ setHamburgerOpen }
                showToast={ props.showToast }
                pending={ pending }
                setPending={ setPending }
            />

            <main id="main-profile">
                {
                    hamburgerOpen &&
                    <HamburgerMenu
                        setHamburgerOpen={ setHamburgerOpen }
                        showToast={ props.showToast }
                        pending={ pending }
                        setPending={ setPending }
                    />
                }

                {
                    !loading && company
                    ?
                    (
                        company.isAdmin === true
                        ?
                        (
                            pendingCompanies.length > 0
                            ?
                            <div id="box-pending-general">
                                {
                                    pendingCompanies.map((company) => (
                                        <div key={ company._id } className="box-pending-element">
                                            <div className="box-content-company">
                                                <img src={ company.logoURL } alt="Logo" />

                                                <ul>
                                                    <li><strong>ID</strong>: { company._id }</li>
                                                    <li><strong>Name</strong>: { company.name }</li>
                                                    <li><strong>VAT</strong>: { company.VAT }</li>
                                                    <li><strong>E-mail</strong>: { company.email }</li>
                                                    <li><strong>Headquarters Coordinates</strong>: { company.headquartersCoordinates.coordinates[1] }, { company.headquartersCoordinates.coordinates[0] }</li>
                                                </ul>
                                            </div>

                                            <div className="box-buttons">
                                                <button onClick={ () => handleAcceptCompany(company._id) }>Accept</button>
                                                <button onClick={ () => handleRejectCompany(company._id) }>Reject</button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            :
                            <p id="p-no-requests">There are no pending requests.</p>
                        )
                        :
                        (
                            pending
                            ?
                            (
                                pendingEmployees.length > 0
                                ?
                                <div id="box-pending-general">
                                    {
                                        pendingEmployees.map((employee) => (
                                            <div key={ employee._id } className="box-pending-element">
                                                <div className="box-content-employee">
                                                    <ul>
                                                        <li><strong>ID</strong>: { employee._id }</li>
                                                        <li><strong>Username</strong>: { employee.username }</li>
                                                        <li><strong>Number of default free seats</strong>: { employee.defaultFreeSeats }</li>
                                                        <li><strong>Default coordinates</strong>: { employee.pin.coordinates[1] }, { employee.pin.coordinates[0] }</li>
                                                    </ul>
                                                </div>

                                                <div className="box-buttons">
                                                    <button onClick={ () => handleAcceptEmployee(employee._id) }>Accept</button>
                                                    <button onClick={ () => handleRejectEmployee(employee._id) }>Reject</button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                <p id="p-no-requests">There are no pending requests.</p>
                            )
                            :
                            (
                                employees.length > 0
                                ?
                                <div id="div-table-overflow">
                                    <table id="table-manage-users">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Default free seats</th>
                                                <th>Coordinates</th>
                                                <th>GreenPoints ↑</th>
                                                <th>Average Rating (1-5)</th>
                                                <th>Self-Certifications</th>
                                                <th>Actions</th>
                                                <th>Gifts</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                employees.map((employee, index) => (
                                                    <tr key={ employee._id }>
                                                        <td>
                                                            { employee.username }

                                                            {
                                                                index === 0 ? "🥇" :
                                                                index === 1 ? "🥈" :
                                                                index === 2 ? "🥉" :
                                                                null
                                                            }
                                                        </td>

                                                        <td>{ employee.defaultFreeSeats }</td>
                                                        
                                                        <td>
                                                            { employee.pin.coordinates[1] },
                                                            <br />
                                                            { employee.pin.coordinates[0] }
                                                        </td>

                                                        <td>{ employee.greenPoints }</td>

                                                        <td>
                                                            {
                                                                isNaN(employee.avgFeedback.feedbackSum / employee.avgFeedback.feedbackCount)
                                                                ?
                                                                "/"
                                                                :
                                                                (employee.avgFeedback.feedbackSum / employee.avgFeedback.feedbackCount).toFixed(2) + " ⭐"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                employee.pendingSelfcertifications.length === 0
                                                                ?
                                                                "/"
                                                                :
                                                                employee.pendingSelfcertifications.map((selfcertification) => {
                                                                    const date = new Date(selfcertification.createdAt);

                                                                    const formattedDate = new Intl.DateTimeFormat("it-IT", {
                                                                        day: "2-digit",
                                                                        month: "2-digit",
                                                                        year: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }).format(date);

                                                                    return (
                                                                        <div key={ selfcertification._id } className="box-self-certifications">
                                                                            <strong>{ formattedDate }</strong>

                                                                            <ul>
                                                                                {
                                                                                    selfcertification.documentsURLs.map((documentURL, index) => (
                                                                                        <li key={ documentURL }>
                                                                                            <a href="/" className="a-download-file" onClick={(e) => handleClickFile(e, employee._id, documentURL)}>File #{index + 1}</a>
                                                                                        </li>
                                                                                    ))
                                                                                }
                                                                            </ul>
                                                                            
                                                                            <div className="button-box">
                                                                                <button onClick={() => handleAcceptSelfcertification(employee._id, selfcertification._id)}>Accept</button>
                                                                                <button onClick={() => handleRejectSelfcertification(employee._id, selfcertification._id)}>Reject</button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </td>

                                                        <td>
                                                            <button onClick={() => handleRejectEmployee(employee._id)}>Delete</button>
                                                        </td>

                                                        {
                                                            index === 0
                                                            &&
                                                            <td rowSpan={ 3 }>
                                                                <img src="./images/gift.svg" alt="Gift" onClick={() => {
                                                                    const hasPending = employees.some(employee => employee.pendingSelfcertifications.length > 0);

                                                                    if(hasPending)
                                                                        props.showToast("You have to manage all the self-certificates first", "error");
                                                                    else
                                                                        setShowFileDropzone(true)
                                                                }} />
                                                            </td>
                                                        }
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>

                                    <div id="div-spacing" />
                                </div>
                                :
                                <p id="p-no-employees">There are no registered employees.</p>
                            )
                        )
                    )
                    :
                    null
                }

                {
                    showFileDropzone
                    &&
                    <div id="file-drop-zone-box">
                        <div id="file-drop-zone-wrapper">
                            <FileDropzone
                                ref={ fileDropzoneRef }
                                accept=".pdf"
                                label={
                                    filesUploaded.length === 0
                                    ?
                                    "Upload the .pdf file for the 1st place winner"
                                    :
                                    filesUploaded.length === 1
                                    ?
                                    "Upload the .pdf file for the 2nd place winner"
                                    :
                                    filesUploaded.length === 2
                                    ?
                                    "Upload the .pdf file for the 3rd place winner"
                                    :
                                    "Limit reached"
                                }
                                onFileSelect={ handleFilesUpload }
                                showToast={ props.showToast }
                                moreFiles={ true }
                            />

                            <div id="file-drop-zone-button-box">
                                <button onClick={ handleSendGifts }>Send</button>
                                <button onClick={ handleCancelFilesUpload }>Cancel</button>
                            </div>
                        </div>
                    </div>
                }

                { confirmDialogElement }
            </main>

            <Footer />
        </>
    );
}

export default Profile;