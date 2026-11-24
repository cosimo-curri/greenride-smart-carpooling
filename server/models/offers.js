const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    departureDate: {
        type: String,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    freeSeats: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger
        }
    },
    departureCoordinates: { //GeoJSON
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
    intermediateStops: [{ //GeoJSON
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }],
    otherInfo: String,
    pendingRequests: {
        type: [
            {
                isDefault: {
                    type: Boolean,
                    required: true
                },
                intermediateStop: { //GeoJSON
                    type: {
                        type: String,
                        enum: ["Point"]
                    },
                    coordinates: {
                        type: [Number] // [longitude, latitude]
                    }
                },
                status: {
                    type: String,
                    enum: ["accepted", "rejected", "pending"],
                    default: "pending",
                    required: true
                },
                employeeRequestId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Employee",
                    required: true
                },
                feedback: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        default: []
    },
    closed: {
        type: Boolean,
        required: true,
        default: false
    },
    distance: { //km
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model("Offer", offerSchema);