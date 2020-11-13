const Joi = require('joi');

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
}

const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        role: Joi.string().required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        password2: Joi.string().min(6).required()
    });
    return schema.validate(data);
}

// exam validations
const examCreateValidation = (data) => {
    const schema = Joi.object({
        examName: Joi.string().min(2).required(),
        examDescription: Joi.string().min(2).required(),
        teacherName: Joi.string().required()
    });
    return schema.validate(data);
}

const addQuestionValidation = (data) => {
    const schema = Joi.object({
        questionName: Joi.string().min(2).required(),
        option1: Joi.string().required(),
        option2: Joi.string().required(),
        option3: Joi.string().required(),
        option4: Joi.string().required(),
        correct: Joi.string().required(),
    });
    return schema.validate(data);
}

// exam validations
const examSubmitValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).required(),
        roll: Joi.string().min(2).required(),
        department: Joi.string().min(2).required(),
    });
    return schema.validate(data);
}


module.exports = {loginValidation, registerValidation, examCreateValidation, addQuestionValidation, examSubmitValidation}