const express = require('express')
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(__dirname + '/../client/dist'));
app.listen(port, () => {
  console.log('Server connected on', port);
});