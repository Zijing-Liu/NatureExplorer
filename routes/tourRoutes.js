const express = require('express');
const app = express();
const tourController = require('../controllers/toursController');
const router = express.Router();
app.use('/api/v1/tours', router);
// params middleware are only running on params
// middleware function chaining
// router.param('id', tourController.checkID);

// create a special rout for the top 5 cheapest tours
// pre-fill some fields in the query string, to run the middleware before running tourController.getAllTours
router
  .route('/top-5-cheapest')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
