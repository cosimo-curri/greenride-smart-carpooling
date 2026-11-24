const buildMissingString = (messages) => {
    const missingMessages = {
        "MISSING_DEPARTURE_TYPE": "departure type",
        "MISSING_DATE": "date",
        "MISSING_TIME": "time"
    };

    const presentMessages = messages
        .map(field => missingMessages[field])
        .filter(Boolean);

    if(presentMessages.length === 0)
        return "";

    if(presentMessages.length === 1)
        return `Oops, missing ${presentMessages[0]}!`;

    const allButLast = presentMessages.slice(0, -1).join(", ");
    const last = presentMessages[presentMessages.length - 1];

    return `Oops, missing ${allButLast} and ${last}!`;
}

const mToKm = (m) => {
    const mFloat = parseFloat(m);

    if(isNaN(mFloat)) return "0.0 km";

    const kmFloat = mFloat / 1000;

    return `${kmFloat.toFixed(1)} km`;
}

const secondsToReadableString = (s) => {
    const sInt = Math.round(parseFloat(s));

    if(isNaN(sInt) || sInt <= 0) return "0 minutes";

    const hours = Math.floor(sInt / 3600);
    const minutes = Math.round((sInt % 3600) / 60);

    const hourStr = hours === 1 ? "1 hour" : `${hours} hours`;
    const minuteStr = minutes === 1 ? "1 minute" : `${minutes} minutes`;

    if(hours > 0 && minutes > 0)
        return `${hourStr} and ${minuteStr}`;
    else if(hours > 0)
        return hourStr;
    else
        return minuteStr;
}

const coordinatesDistance = (lat1, lon1, lat2, lon2) => {
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

module.exports = {
    buildMissingString,
    mToKm,
    secondsToReadableString,
    coordinatesDistance
};