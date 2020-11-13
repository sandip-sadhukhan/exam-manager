const express = require('express');
const router = express.Router();
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const path = require('path');
const { studentOnly, teacherOnly } = require('../utils/verify');
const { examCreateValidation, addQuestionValidation, examSubmitValidation } = require('../utils/validate');

// Load models
const Exam = require('../models/exam');
const Question = require('../models/question');
const Student = require('../models/student');

// Create exam route  - GET
router.get('/create', teacherOnly, (req, res) => {
    res.render('exam/createExam', { errors: [] });
});

// Handle exam name and description form - POST
router.post('/create', teacherOnly, async (req, res) => {
    // Validation
    const { error } = examCreateValidation(req.body);
    if (error) return res.render('exam/createExam', { errors: [error.details[0].message] });

    // Create an exam
    const newExam = new Exam({
        examName: req.body.examName,
        examDescription: req.body.examDescription,
        teacherName: req.body.teacherName
    });
    await newExam.save();
    // Add the exam in current user
    req.user.exams.push(newExam);
    await req.user.save();

    res.redirect(`/exam/${newExam._id}/add`);
});


// Add a question  - GET http://localhost:5000/exam/5fadfde7a0c08729c8e7834a/add
router.get('/:id/add', teacherOnly, async (req, res) => {
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }
    // console.log(exam);
    res.render('exam/addQuestion', { exam, errors: [] });
});


// Add Question Form Handle - POST
router.post('/:id/add', teacherOnly, async(req, res) => {
    // Find the exam
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }
    // console.log(req.body)
    // Validation
    const { error } = addQuestionValidation(req.body);
    if (error) {
        return res.render('exam/addQuestion', { exam, errors: [error.details[0].message] });
    }

    // Create the question
    const newQuestion = new Question({
        question: req.body.questionName,
        option1: req.body.option1,
        option2: req.body.option2,
        option3: req.body.option3,
        option4: req.body.option4,
        correct: req.body.correct
    });
    try {
        await newQuestion.save();
    } catch (err) {
        return res.redirect('/error');
    }
    // Add the new question into exam
    exam.questions.push(newQuestion);
    await exam.save();
    res.render('exam/addQuestion', { exam, errors: [] });
})

// Exam Dashboard - GET - need to login first
router.get('/:id/show', teacherOnly, async(req, res) => {
    // Find the exam
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }
    // Calculations
    let totalQuestions = exam.questions.length;
    let totalStudentsAttended = exam.students.length;
    let students = exam.students;
    let studentsArr = []
    let totalMarks = 0;
    let totalAttempted = 0;
    for (let i = 0; i < students.length; i++) {
        const student = await Student.findById(students[i]);
        studentsArr.push(student);
        totalMarks += student.marks
        totalAttempted += student.attended
    }
    let avgMarks = (totalMarks/ studentsArr.length).toFixed(2);
    let avgAttempted = (totalAttempted/ studentsArr.length).toFixed(2);

    res.render('exam/examDashboard', {
        exam, 
        host: req.get('host'), 
        totalQuestions, 
        totalStudentsAttended,
        students: studentsArr,
        avgAttempted,
        avgMarks
    });
})

// Exam preview - only for teacher who own this exam
router.get('/:id/preview', teacherOnly, async(req, res) => {
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }
    let questionArr = [];
    for (let i = 0; i < exam.questions.length; i++) {
        const element = exam.questions[i];
        let indivitualQuestion = await Question.findById(element);
        questionArr.push(indivitualQuestion);
    }
    res.render('exam/previewExam', {exam, questionArr});
})

// Attend the exam - GET
router.get('/:id', studentOnly, async(req, res) => {
    let exam;
    try {
        exam = await Exam.findById(req.params.id)
    } catch (err) {
        return res.redirect('/error');
    }
    // if the exam is close
    if(!exam.isOpen) return res.redirect('/error');

    let questionArr = [];
    for (let i = 0; i < exam.questions.length; i++) {
        const element = exam.questions[i];
        let indivitualQuestion = await Question.findById(element);
        questionArr.push(indivitualQuestion);
    }
    res.render('exam/showExam', {exam, questionArr, errors:[]});
})

// Hanle the exam submit - POST
router.post('/:id', studentOnly, async(req, res) => {
    let exam;
    try {
        exam = await Exam.findById(req.params.id)
    } catch (err) {
        return res.redirect('/error');
    }
    // if the exam is close
    if(!exam.isOpen) return res.redirect('/error');

    let questionArr = [];
    for (let i = 0; i < exam.questions.length; i++) {
        const element = exam.questions[i];
        let indivitualQuestion = await Question.findById(element);
        questionArr.push(indivitualQuestion);
    }

    // Validation
    let studentInfo = {name: req.body.name, roll: req.body.roll, department: req.body.department}
    const { error } = examSubmitValidation(studentInfo);
    if (error) {
        return res.render('exam/showExam', {exam, questionArr, errors: [error.details[0].message] })
    };
    // Calculate the result
    // format the result
    studentAns = {}
    for(let i=0;i<questionArr.length;i++){
        let j = (i+1).toString();
        studentAns[i] = req.body[j]
    }
    // console.log("REQ BODY",req.body)
    // console.log("STUDENT ANS",studentAns)
    let marks = 0;
    let attended = 0;
    for (let i = 0; i < questionArr.length; i++) {
        const q = questionArr[i];
        // console.log(`CORRECT at ${i} = ${q.correct}`)
        if(studentAns[i] !== undefined){
            attended += 1;
        }
        if(q.correct == studentAns[i]){
            marks += 1
        }
    }
    // console.log(`Marks = ${marks}`)
    // console.log(`Attended = ${attended}`)
    // Save student
    let newStudent = new Student({
        studentName: req.body.name,
        studentRoll: req.body.roll,
        studentDepartment: req.body.department,
        marks,
        attended
    });
    await newStudent.save();
    // Add student in exam
    exam.students.push(newStudent);
    await exam.save();
    let percentage = marks/questionArr.length * 100;
    res.render('exam/resultExam', {exam, newStudent, percentage});
});

// Open a exam
router.get('/:id/open', teacherOnly, async(req, res) => {
    // Find the exam
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }

    if(!exam.isOpen){
        exam.isOpen = true;
        await exam.save();
    }
    res.redirect('/dashboard');
})

// Open a exam
router.get('/:id/close', teacherOnly, async(req, res) => {
    // Find the exam
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }

    if(exam.isOpen){
        exam.isOpen = false;
        await exam.save();
    }
    res.redirect('/dashboard');
})

// Download CSV DATA
router.get('/:id/download-csv', teacherOnly, async(req, res) => {
    // Verify
    // Find the exam
    let exam;
    try {
        let exams = req.user.exams;
        let filteredExams = exams.filter(exam => exam._id == req.params.id);
        if (filteredExams.length === 0) {
            return res.redirect('/error');
        }
        try {
            exam = await Exam.findById(filteredExams[0]);
        } catch (err) {
            return res.redirect('/error');
        }
    } catch (err) {
        return res.redirect('/error');
    }

    // Data collection
    let students = exam.students;
    let studentsArr = []
    for (let i = 0; i < students.length; i++) {
        const student = await Student.findById(students[i]);
        studentsArr.push(student);
    }
    // Make the csv
    // const studentData = [
    //     {
    //         "Student Name": "Sandip Sadhukhan",
    //         "Roll No": "182087283",
    //         "Question Attended": "10",
    //         "Marks": "10"
    //     }
    // ]
    const studentData = studentsArr.map((student) => {
        return {
            "Student Name": student.studentName,
            "Roll No": student.studentRoll,
            "Department": student.studentDepartment,
            "Question Attended": student.attended,
            "Marks": student.marks
        }
    })
    const csv = new ObjectsToCsv(studentData);
    const fileName = exam.examName + '.csv';
    // Save to file:
    console.log(__dirname)
    await csv.toDisk(path.resolve(__dirname,'../', 'public_csv', fileName));

    // download the file
    return res.download(path.resolve(__dirname,'../', 'public_csv', fileName), () => {
        fs.unlinkSync(path.resolve(__dirname,'../', 'public_csv', fileName))
    })

    // redirect
    // res.redirect(`/exam/${req.params.id}/show`)
})


module.exports = router;