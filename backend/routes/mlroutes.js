const router = require('express').Router();
const {judgeAndGenerate,llmController} = require('../controllers/mlcontroler');

const protected = require('../middleware/protected')

router.post('/judgeAndGenerate',  judgeAndGenerate);
router.post('/llm', llmController);





module.exports = router;