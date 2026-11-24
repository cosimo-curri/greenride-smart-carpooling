const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

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

const uploadFiles = async (url, files, customHeaders = {}) => {
    try {
        const formData = new FormData();

        files.forEach((file, index) => {
            formData.append("files", {
                uri: file.uri,
                name: file.name || `file_${index}`,
                type: file.type || "application/octet-stream"
            });
        });

        const res = await fetch(url, {
            method: "POST",
            headers: {
                ...customHeaders
            },
            body: formData
        });

        if (!res.ok) return { success: false };

        const data = await res.json();
        return { success: true, data };
    } catch(_) {
        return { success: false };
    }
};

const apiManager = {
    api: {
        getAllCompanies: `${BASE_URL}/apiEmployees/getAllCompanies`, //GET
        signup: `${BASE_URL}/apiEmployees/signup`, //POST
        signin: `${BASE_URL}/apiEmployees/signin`, //POST
        logout: `${BASE_URL}/apiEmployees/logout`, //GET
        uploadSelfcertifications: `${BASE_URL}/tokenApiEmployees/file/uploadSelfcertifications` //POST
    },
    tokenApi: {
        transcribeAudio: `${BASE_URL}/tokenApiEmployees/transcribeAudio`, //POST
        getChangableValuesByEmployeeId: `${BASE_URL}/tokenApiEmployees/getChangableValuesByEmployeeId`, //GET
        sendLLM: `${BASE_URL}/tokenApiEmployees/manageLLM/send`, //POST
        savePendingRequest: `${BASE_URL}/tokenApiEmployees/manageOffers/savePendingRequest`, //POST
        acceptPendingRequest: `${BASE_URL}/tokenApiEmployees/manageOffers/acceptPendingRequest`, //POST
        rejectPendingRequest: `${BASE_URL}/tokenApiEmployees/manageOffers/rejectPendingRequest`, //POST
        sendFeedback: `${BASE_URL}/tokenApiEmployees/sendFeedback`, //POST
        closeOffer: `${BASE_URL}/tokenApiEmployees/manageOffers/closeOffer`, //POST
        getRanking: `${BASE_URL}/tokenApiEmployees/getRanking`, //GET
        notifyEmployeeStop: `${BASE_URL}/tokenApiEmployees/notifyEmployeeStop` //POST
    },
    methods: {
        post: post,
        get: get,
        uploadFiles: uploadFiles
    },
    info: { promotionalStoriesEnabled: process.env.EXPO_PUBLIC_PROMOTIONAL_STORIES_ENABLED === "true" },
    remoteAssets: {
        user1_story1: `${BASE_URL}/contents/user1-story1.gif`,
        user1_story2: `${BASE_URL}/contents/user1-story2.gif`,
        user1_story3: `${BASE_URL}/contents/user1-story3.gif`,
        user2_story1: `${BASE_URL}/contents/user2-story1.png`,
        user2_story2: `${BASE_URL}/contents/user2-story2.png`,
        user3_story1: `${BASE_URL}/contents/user3-story1.png`,
        user3_story2: `${BASE_URL}/contents/user3-story2.png`,
        user4_story1: `${BASE_URL}/contents/user4-story1.png`
    }
};

export default apiManager;