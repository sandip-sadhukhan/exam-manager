const authVerify = (req, res, next) => {
    if (req.user) {
        next();
    }
    else {
        return res.redirect('/user/login');
    }
}

const notAuthVerify = (req, res, next) => {
    if (!req.user) {
        return next();
    }
    else {
        return res.redirect('/');
    }
}

const teacherOnly = (req, res, next) => {
    if (req.user && req.user.isTeacher) {
        return next();
    }
    return res.redirect('/');
}

const studentOnly = (req, res, next) => {
    if (req.user && !req.user.isTeacher) {
        return next();
    }
    return res.redirect('/user/login');
}

module.exports = {authVerify, notAuthVerify, teacherOnly, studentOnly};