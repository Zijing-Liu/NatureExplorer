// everything about the server setup， database configuration, error handling, environmental variables, ect.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// config should go above the app
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const app = require('./app.js');

// show the environment variables --- development environment
// console.log(process.env);
// 4️⃣ START THE SERVER
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`App running on part ${port}... `);
});
