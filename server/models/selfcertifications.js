const mongoose = require("mongoose");

const selfcertificationSchema = new mongoose.Schema({
    documentsURLs: {
        type: [String],
        required: true,
        validate: {
            validator: function(arr) {
                return Array.isArray(arr) && arr.length > 0;
            }
        }
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    companyManagement: {
        type: String,
        enum: ["accepted", "rejected", "pending"],
        default: "pending",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Selfcertification", selfcertificationSchema);