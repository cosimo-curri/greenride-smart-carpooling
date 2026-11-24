const mongoose = require("mongoose");

const greenInfoSchema = mongoose.Schema({
    totalDistance: { //km
        type: Number,
        required: true,
        default: 0
    },
    totalSavedCO2: { //kg
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model("GreenInfo", greenInfoSchema);