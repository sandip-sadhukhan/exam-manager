const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
    examName: {
        type: String,
        required: true,
        min: 2
    },
    examDescription: {
        type: String,
        required: true,
        min: 2
    },
    teacherName: {
        type: String,
        required: true
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Exam', examSchema);