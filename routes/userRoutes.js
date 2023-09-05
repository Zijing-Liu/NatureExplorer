const express = require('express');
const app = express();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
app.use('/api/v1/users', router);

// a special endpoint doesn't follow the REST practice
router.post('/signup', authController.signup);

router.route('/').get(getAllUsers).get(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
