const express = require('express');
const router = express.Router();
const {teacherOnly, studentOnly} = require('../utils/verify')

// Load models
const Exam = require('../models/exam');

// The Index route  - GET
router.get('/', (req, res) => {
    res.render('index/index');
});

// The About route  - GET
router.get('/about', (req, res) => {
    res.render('index/about');
});

// Dashboard - GET - need to login first
router.get('/dashboard', teacherOnly, async(req, res) => {
    const exams = await Exam.find({}).sort('-date');
    res.render('exam/dashboard', {exams});
})

// Error page
router.get('/error', (req, res) => {
    res.render('index/page404');
})

// Attend Exam
router.get('/attend-exam', studentOnly, (req, res) => {
    res.render('exam/attendExam');
})

// Attend Exam handle form - POST
router.post('/attend-exam', studentOnly, (req, res) => {
    res.redirect(req.body.examlink);
})


module.exports = router;