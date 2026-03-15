const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamps');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
    try {
        if (req.params.bootcampId) {
            const courses = await Course.find({ bootcamp: req.params.bootcampId });
            return res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });
        } else {
            res.status(200).json(res.advancedResults);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id).populate({
            path: 'bootcamp',
            select: 'name description'
        });

        if (!course) {
            return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
};

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = async (req, res, next) => {
    try {
        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user.id;

        const bootcamp = await Bootcamp.findById(req.params.bootcampId);

        if (!bootcamp) {
            return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404));
        }

        // Check ownership
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to this bootcamp`, 401));
        }

        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
};

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
        }

        // Check ownership
        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
        }

        // Check ownership
        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
        }

        await course.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload video for course
// @route   PUT /api/v1/courses/:id/video
// @access  Private
exports.courseVideoUpload = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
        }

        // Check ownership
        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
        }

        if (!req.files) {
            return next(new ErrorResponse('Please upload a file', 400));
        }

        const file = req.files.file;

        // Make sure it's a video
        if (!file.mimetype.startsWith('video')) {
            return next(new ErrorResponse('Please upload a video file', 400));
        }

        // Check file size (100MB max)
        if (file.size > process.env.MAX_VIDEO_UPLOAD) {
            return next(new ErrorResponse(`Please upload a video less than ${process.env.MAX_VIDEO_UPLOAD / 1000000}MB`, 400));
        }

        // Create custom filename
        file.name = `video_${course._id}${path.parse(file.name).ext}`;

        file.mv(`${process.env.VIDEO_UPLOAD_PATH}/${file.name}`, async (err) => {
            if (err) {
                console.error(err);
                return next(new ErrorResponse('Problem with file upload', 500));
            }
            await Course.findByIdAndUpdate(req.params.id, { video: file.name });
            res.status(200).json({ success: true, data: file.name });
        });
    } catch (error) {
        next(error);
    }
};
