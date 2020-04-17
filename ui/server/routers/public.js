const express = require('express');
const compress = require('compression');
const path = require('path');

const router = express.Router();
router.use(compress());
router.use(express.static(path.join(__dirname, '../../client/build')));
router.use(express.static(process.cwd() + '/public'));
router.get('*', function(req, res) {
  res.sendFile(path.join(process.cwd(), './client/build', 'index.html'));
});

module.exports = router;
