const express = require('express');
const app = express();

const router = express.Router();
const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require('../controllers/userController');
app.use('/api/v1/users', router);


router
    .route('/')
    .get(getAllUsers)
    .get(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;