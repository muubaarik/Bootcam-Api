const express = require('express');
const {
    getBootcamp,
    getBootcamps,
    updateBootcamp,
    createBootcamp,
    deleteBootcamp,
    bootcampPhotoUpload,
    getBootcampsInRadius
} = require('../controllers/bootcams');

const Bootcamp = require('../models/Bootcamps');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/')
    .get(advancedResults(Bootcamp), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);





/*router.get('/',(req,res)=>{
    res.status(200).json({success: true,  msg: 'show all bootcams'})
 
 })
 
 router.get('/:id',(req,res)=>{
     res.status(200).json({success: true,  msg: `show bootcams ${req.params.id}`})
  
  })
 
  router.post('/',(req,res)=>{
     res.status(200).json({success: true,  msg: 'Create  all bootcam'})
  
  })
 
  router.put('/:id',(req,res)=>{
     res.status(200).json({success: true,  msg: `update  all bootcams ${req.params.id}`})
  
  })
 
  router.delete('/:id',(req,res)=>{
     res.status(200).json({success: true,  msg: `delet all bootcams ${req.params.id}`})
  
  });*/

  module.exports = router;