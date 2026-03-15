const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamps');
const geocoder = require('../utils/geocoder');
const cloudinary = require('../utils/cloudinary');

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access public
exports.getBootcamps = async (req, res, next) => {
    res.status(200).json(res.advancedResults);
};

// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({ success: true, data: bootcamp });
    } catch (error) {
        next(error);
    }
};

// @desc Get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access public
exports.getBootcampsInRadius = async (req, res, next) => {
    try {
        const { zipcode, distance } = req.params;

        // Get lat/lng from geocoder
        const loc = await geocoder.geocode(zipcode + ', USA');
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        // Calc radius using radians
        // Earth radius = 6,378 km / 3,963 miles
        const radius = distance / 6378;

        const bootcamps = await Bootcamp.find({
            location: {
                $geoWithin: { $centerSphere: [[lng, lat], radius] }
            }
        });

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        });
    } catch (error) {
        next(error);
    }
};

// @desc Create a new bootcamp
// @route POST /api/v1/bootcamps
// @access private
exports.createBootcamp = async (req, res, next) => {
    try {
        // Attach logged-in user to body
        req.body.user = req.user.id;

        // A publisher can only add one bootcamp
        const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
        if (publishedBootcamp && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} has already published a bootcamp`, 400));
        }

        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
};

// @desc Update a bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access private
exports.updateBootcamp = async (req, res, next) => {
    try {
        let bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Check ownership
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: bootcamp });
    } catch (error) {
        next(error);
    }
};

// @desc Delete a bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Check ownership
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`, 401));
        }

        await bootcamp.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access private
exports.bootcampPhotoUpload = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
        }

        // Check ownership
        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`, 401));
        }

        if (!req.files) {
            return next(new ErrorResponse('Please upload a file', 400));
        }

        const file = req.files.file;

        if (!file.mimetype.startsWith('image')) {
            return next(new ErrorResponse('Please upload an image file', 400));
        }

        if (file.size > process.env.MAX_FILE_UPLOAD) {
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000}KB`, 400));
        }

        // Upload to Cloudinary via buffer stream
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'bootcam/photos', public_id: `photo_${bootcamp._id}`, overwrite: true, resource_type: 'image' },
            async (error, result) => {
                if (error) {
                    console.error(error);
                    return next(new ErrorResponse('Problem with file upload', 500));
                }
                await Bootcamp.findByIdAndUpdate(req.params.id, { photo: result.secure_url });
                res.status(200).json({ success: true, data: result.secure_url });
            }
        );
        uploadStream.end(file.data);
    } catch (error) {
        next(error);
    }
};
