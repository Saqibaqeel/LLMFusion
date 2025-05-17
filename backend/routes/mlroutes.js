const router = require('express').Router();
const {judgeAndGenerate} = require('../controllers/mlcontroler');

const protected = require('../middleware/protected')

router.post('/judgeAndGenerate',  judgeAndGenerate);




module.exports = router;