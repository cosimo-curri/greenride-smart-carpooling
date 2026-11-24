const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

//THE PASSWORD FIELD IS NOT REQUIRED DUE TO ITS AUTOMATIC MANAGEMENT BY passport-local-mongoose
const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    VAT: {
        type: String, //BECAUSE OF 0s AT THE START, NO MATH, BETTER MEMORY USAGE
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                const forbiddenEmails = [process.env.ADMIN_GREENRIDE_EMAIL];
                return !forbiddenEmails.includes(value);
            }
        }
    },
    headquartersCoordinates: { //GeoJSON
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: { //LONGITUDE, LATITUDE
            type: [Number],
            required: true
        }
    },
    logoURL: {
        type: String,
        required: true,
        unique: true
    },
    currentValidToken: String, //SECURITY TECHNIQUE
    secureSignUp: {
        active: {
            type: Boolean,
            default: false
        },
        activationToken: String,
        adminActivation: {
            type: Boolean,
            default: false
        }
    },
    changePasswordToken: String
});

companySchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});

module.exports = mongoose.model("Company", companySchema);