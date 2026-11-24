const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

//THE PASSWORD FIELD IS NOT REQUIRED DUE TO ITS AUTOMATIC MANAGEMENT BY passport-local-mongoose
const employeeSchema = new mongoose.Schema({
    username: {
        type: String,
        default: "temp"
    },
    defaultFreeSeats: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger
        }
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    pin: { //GeoJSON
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    currentValidToken: String, //SECURITY TECHNIQUE
    companyManagement: {
        type: String,
        enum: ["accepted", "rejected", "pending"],
        default: "pending",
        required: true
    },
    greenPoints: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: Number.isInteger
        }
    },
    notificationToken: String,
    notifications: {
        type: [
            {
                title: {
                    type: String,
                    required: true
                },
                message: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                    required: true
                }
            }
        ],
        default: []
    },
    avgFeedback: {
        feedbackSum: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: Number.isInteger
            }
        },
        feedbackCount: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: Number.isInteger
            }
        }
    }
});

employeeSchema.plugin(AutoIncrement, { inc_field: "userNumber" });

employeeSchema.plugin(passportLocalMongoose, {
    usernameField: "username"
});

module.exports = mongoose.model("Employee", employeeSchema);