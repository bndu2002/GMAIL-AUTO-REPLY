const { google } = require('googleapis');
const axios = require('axios')


const getToken = async (req, res, next) => {
    try {

        const code = req.query.code

        console.log("code is here " , code)

        // Exchange the authorization code for an access token
        let { data } = await axios({
            url: 'https://oauth2.googleapis.com/token',
            method: 'post',
            params: {
                code,
                client_id: '739115459157-406g2tg5rumsn2l59cik5ga7n76uk0n7.apps.googleusercontent.com',
                client_secret: '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',
                redirect_uri: 'http://localhost:3001/oauth2callback',
                grant_type: 'authorization_code'
            }
        });
        console.log('API response:', data);

        let access_token = data.access_token;
        let refresh_token = data.refresh_token;

        //For getting the user info

        // const response = await axios({
        //     method: 'GET',
        //     url: 'https://www.googleapis.com/oauth2/v1/userinfo',
        //     headers: {
        //         Authorization: `Bearer ${access_token}`,
        //     },
        // });

        // const email = response.data.email;

        // req.email = email
        //console.log('Email:', email);


        req.accessToken = access_token
        req.refreshToken = refresh_token

        // Store refresh token in a cookie
        //res.cookie('refreshToken', refresh_token, { httpOnly: true })
        next()


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { getToken }