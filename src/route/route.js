const express = require('express')
const router = express.Router()
const { setConnection, mailDetails } = require('../controller/controller')
const { getToken } = require('../auth/auth')


router.get('/test', (req, res) => {
    res.status(200).send({ status: true, message: "application running !" })
})
router.get('/connect', setConnection)

router.get('/oauth2callback', getToken, mailDetails)

module.exports = router