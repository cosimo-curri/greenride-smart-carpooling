const formatCoordinates = (value, type) => {
    if (!value) return null;

    let maxIntDigits;

    switch(type) {
        case "latitude":
            maxIntDigits = 2;
            break;
        
        case "longitude":
            maxIntDigits = 3;
            break;
        
        default:
            return null;
    }

    const maxDecDigits = 4;

    let clean = value.replace(/[^0-9.,-]/g, "");
    clean = clean.replace(/,/g, ".");

    const firstDotIndex = clean.indexOf(".");

    if(firstDotIndex !== -1) {
        const beforeDot = clean.slice(0, firstDotIndex + 1);
        const afterDot = clean.slice(firstDotIndex + 1).replace(/\./g, "");
        clean = beforeDot + afterDot;
    }

    const hasMinus = clean.startsWith("-");
    clean = clean.replace(/-/g, "");

    if (hasMinus) clean = "-" + clean;

    const endsWithDot = clean.endsWith(".");

    let parts = clean.split(".");

    let intPart = parts[0];
    let decPart = parts[1] || "";

    intPart = intPart.slice(0, maxIntDigits);
    decPart = decPart.slice(0, maxDecDigits);

    if(endsWithDot)
        return (hasMinus ? "-" : "") + intPart + ".";
    else if(decPart.length > 0)
        return (hasMinus ? "-" : "") + intPart + "." + decPart;
    else
        return (hasMinus ? "-" : "") + intPart;
}

const checkCoordinates = (latitude, longitude) => {
    let message = "";
    let valid = true;

    const checks = [
        {
            test: lat => lat !== null && lat !== "",
            msg: "Latitude is not empty"
        },
        {
            test: lon => lon !== null && lon !== "", 
            msg: "Longitude is not empty"
        },
        {
            test: lat => !isNaN(Number(lat)),
            msg: "Latitude is a valid number"
        },
        {
            test: lon => !isNaN(Number(lon)),
            msg: "Longitude is a valid number"
        },
        {
            test: lat => Number(lat) >= -90 && Number(lat) <= 90,
            msg: "Latitude is between -90° and 90°"
        },
        {
            test: lon => Number(lon) >= -180 && Number(lon) <= 180,
            msg: "Longitude is between -180° and 180°"
        }
    ];

    for(const check of checks) {
        const value = check.msg.includes("Latitude") ? latitude : longitude;

        if(check.test(value))
            message += "🌿 " + check.msg + "\n";
        else {
            message += "❌ " + check.msg + "\n";
            valid = false;
        }
    }

    return { valid, message };
};

const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const checkPasswords = (password, passwordConfirm) => {
    let message = "";
    let valid = true;

    const checks = [
        { test: pwd => pwd.length >= 8, msg: "At least 8 characters" },
        { test: pwd => /[a-z]/.test(pwd), msg: "At least 1 lowercase letter" },
        { test: pwd => /[A-Z]/.test(pwd), msg: "At least 1 uppercase letter" },
        { test: pwd => /[0-9]/.test(pwd), msg: "At least 1 number" },
        { test: pwd => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), msg: "At least 1 special character" },
    ];

    for(const check of checks) {
        if(check.test(password))
            message += "🌿 " + check.msg + "\n";
        else {
            message += "❌ " + check.msg + "\n";
            valid = false;
        }
    }

    if(password === passwordConfirm)
        message += "🌿 Passwords must match\n";
    else {
        message += "❌ Passwords must match\n";
        valid = false;
    }

    return { valid, message };
};

const utils = {
    formatCoordinates,
    isValidEmail,
    checkPasswords,
    checkCoordinates
};

export default utils;