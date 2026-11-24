const BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const post = async (url, body, customHeaders = {}) => {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...customHeaders
            },
            body: JSON.stringify(body)
        });

        if(!res.ok)
            return { success: false };

        const data = await res.json();

        return { success: true, data: data };
    } catch(_) {
        return { success: false };
    }
}

const get = async (url, customHeaders = {}) => {
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                ...customHeaders
            }
        });

        if (!res.ok)
            return { success: false };

        const data = await res.json();

        return { success: true, data: data };
    } catch (_) {
        return { success: false };
    }
}

const del = async (url, body, customHeaders = {}) => {
    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...customHeaders
            },
            body: JSON.stringify(body)
        });

        if(!res.ok)
            return { success: false };

        const data = await res.json();

        return { success: true, data: data };
    } catch(_) {
        return { success: false };
    }
}

const uploadFiles = async (url, files, customHeaders = {}) => {
    try {
        const formData = new FormData();
        
        files.forEach(file => {
            formData.append("filesArray", file);
        });

        const res = await fetch(url, {
            method: "POST",
            body: formData, //NO Content-Type BECAUSE IS AUTOMATIC
            headers: {
                ...customHeaders
            }
        });

        if(!res.ok)
            return { success: false };

        const data = await res.json();

        return { success: true, data: data };
    } catch(_) {
        return { success: false };
    }
}

const downloadProtectedFile = async (url, headers = {}) => {
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                ...headers
            }
        });

        if(!res.ok)
            return { success: false };

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        const urlWithFilename = new URL(url);
        const path = urlWithFilename.pathname;
        const filename = path.substring(path.lastIndexOf("/") + 1);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);

        return { success: true };
    } catch(_) {
        return { success: false };
    }
};

const apiManager = {
    api: {
        signup: `${BASE_URL}/apiCompanies/signup`, //POST
        uploadLogo: `${BASE_URL}/apiCompanies/file/uploadLogo`, //POST
        signin: `${BASE_URL}/apiCompanies/signin`, //POST
        logout: `${BASE_URL}/apiCompanies/logout`, //GET
        requestRestorePassword: `${BASE_URL}/apiCompanies/managePassword/requestRestorePassword`, //POST
        restorePassword: `${BASE_URL}/apiCompanies/managePassword/restorePassword`, //POST
        uploadGifts: `${BASE_URL}/tokenApiCompanies/file/uploadGifts` //POST
    },
    tokenApi: {
        getAllPendingSignUpRequests: `${BASE_URL}/tokenApiCompanies/manageCompanies/getAllPendingSignUpRequests`, //GET,
        acceptCompany: `${BASE_URL}/tokenApiCompanies/manageCompanies/acceptCompany`, //POST
        rejectCompany: `${BASE_URL}/tokenApiCompanies/manageCompanies/rejectCompany`, //DELETE
        getAllPendingEmployeesSignUp: `${BASE_URL}/tokenApiCompanies/manageEmployees/getAllPendingEmployeesSignUp`, //GET
        acceptEmployee: `${BASE_URL}/tokenApiCompanies/manageEmployees/acceptEmployee`, //POST
        rejectEmployee: `${BASE_URL}/tokenApiCompanies/manageEmployees/rejectEmployee`, //POST
        getAllCompanyEmployees: `${BASE_URL}/tokenApiCompanies/manageEmployees/getAllCompanyEmployees`, //GET
        getAllPendingSelfcertification: `${BASE_URL}/tokenApiCompanies/manageSelfcertifications/getAllPendingSelfcertification`, //GET
        acceptSelfcertification: `${BASE_URL}/tokenApiCompanies/manageSelfcertifications/acceptSelfcertification`, //POST
        rejectSelfcertification: `${BASE_URL}/tokenApiCompanies/manageSelfcertifications/rejectSelfcertification` //POST
    },
    methods: {
        post: post,
        get: get,
        del: del,
        uploadFiles: uploadFiles,
        downloadProtectedFile: downloadProtectedFile
    }
};

export default apiManager;