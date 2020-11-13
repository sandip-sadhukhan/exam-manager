const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentRoll: {
        type: String,
        required: true
    },
    studentDepartment: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    attended: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Student', studentSchema);