const Company = require("../models/companies");
const Employee = require("../models/employees");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// FOR SEMPLICITY THIS FILE HANDLES ALSO OPERATIONS ON MONGOOSE-MODEL THAT NOT REPRESENT A MIDDLEWARE (req, res, next) ///
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.validateCoordinates = (coordinates) => {
    if(!Array.isArray(coordinates) || coordinates.length !== 2) return false;
    const longitude = coordinates[0];
    const latitude = coordinates[1];

    if(latitude === null || latitude === "") return false;
    if(longitude === null || longitude === "") return false;

    const latNum = Number(latitude);
    const lonNum = Number(longitude);

    if(isNaN(latNum) || isNaN(lonNum)) return false;
    if(latNum < -90 || latNum > 90) return false;
    if(lonNum < -180 || lonNum > 180) return false;

    return true;
};

exports.fileUpload = require("./fileStorage").fileUpload;

//CHECK ON findOneAndUpdate WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
exports.changeCurrentToken = async (companyId, token) => {
    await Company.findOneAndUpdate({ _id: companyId }, { currentValidToken: token });
};

exports.clientFilterCompany = (company) => {
    return {
        _id: company._id,
        name: company.name,
        VAT: company.VAT,
        email: company.email,
        headquartersCoordinates: company.headquartersCoordinates,
        logoURL: company.logoURL
    };
};

//CHECK ON findOneAndUpdate WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
exports.invalidToken = async (companyId) => {
    await Company.findOneAndUpdate({ _id: companyId }, { currentValidToken: null });
};

//CHECK ON findOneAndUpdate WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
exports.changeCurrentTokensEmployee = async (employeeId, token, notificationToken) => {
    await Employee.findOneAndUpdate({ _id: employeeId }, { currentValidToken: token, notificationToken: notificationToken });
};

exports.clientFilterEmployee = (employee) => {
    const employeeCompany = this.clientFilterCompany(employee.company);

    return {
        _id: employee._id,
        username: employee.username,
        defaultFreeSeats: employee.defaultFreeSeats,
        company: employeeCompany,
        pin: employee.pin,
        greenPoints: employee.greenPoints
    };
};

//CHECK ON findOneAndUpdate WITHOUT USING .then AND .catch FOR CODING CONVENIENCE
exports.invalidTokensEmployee = async (employeeId) => {
    await Employee.findOneAndUpdate({ _id: employeeId }, { currentValidToken: null, notificationToken: null });
};

exports.sendEmployeeAppNotification = async (notificationToken, title, message) => {
    if(notificationToken) {
        try {
            await fetch(process.env.EXPO_NOTIFICATION_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: notificationToken,
                    title: title,
                    body: message
                })
            });
        } catch(_) {}
    }
};

exports.sendLLM = async (prompt, reasoning) => {
    try {
        const model = reasoning ? "deepseek/deepseek-r1-0528:free" : "deepseek/deepseek-chat-v3-0324:free";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "X-Title": "GreenRide",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        });

        if(!response.ok)
            return null;

        const data = await response.json();
        
        return data;
    } catch(e) {
        return null;
    }
};

exports.cleanLLMResponseSafe = (response) => {
    return response
        .replace(/```[\s\S]*?```/g, match => match.replace(/```(?:json)?/gi, "").trim())
        .replace(/^[^{]*?({[\s\S]*?})[^}]*?$/s, "$1")
        .trim();
}

exports.coordinatesDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (deg) => deg * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c;

    return distance;
}

exports.minutesDistance = (time1, time2) => {
    const toMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const minutes1 = toMinutes(time1);
    const minutes2 = toMinutes(time2);

    return Math.abs(minutes1 - minutes2);
}

exports.calculateGreenPoints = (passengers, distance) => {
    const basePointsPerKm = 0.2;
    let passengersCoefficient = 0;

    if(passengers > 0)
        passengersCoefficient = 1 + 0.7 * (passengers - 1);

    return Math.round(basePointsPerKm * distance * passengersCoefficient);
}