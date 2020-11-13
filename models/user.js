const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        min:6,
        max: 255
    },
    isTeacher: {
        type: Boolean,
        required: true,
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }]
});

module.exports = mongoose.model('User', userSchema);