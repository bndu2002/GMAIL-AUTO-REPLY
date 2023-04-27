const { google } = require('googleapis');
const Buffer = require('buffer').Buffer;


//https://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
//https://developers.google.com/gmail/api/quickstart/nodejs
//https://ansoncareers.notion.site/Software-Engineering-Challenges-2ed6ef67ceeb4df58713983523f07698
//https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html

const CLIENT_ID = '739115459157-406g2tg5rumsn2l59cik5ga7n76uk0n7.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const setConnection = async (req, res) => {
    try {
        console.log("code", req.query.code)

        const authorizeUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });

        console.log(`Visit this URL to authorize the application: ${authorizeUrl}`);
        return res.redirect(authorizeUrl)
        //return res.status(200).send({ status: true, data: authorizeUrl })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


const mailDetails = async (req, res) => {
    try {
        console.log("called")


        console.log('Access token:', req.accessToken);
        //console.log('Refresh token:', refresh_token)


        const auth = new google.auth.OAuth2()

        auth.setCredentials({ access_token: req.accessToken })

        const gmail = google.gmail({ version: 'v1', auth });


        const response = await gmail.users.messages.list({
            userId: 'me',
            q: 'in:inbox -from:me -{label:SENT} -{label:CHAT} -{label:DRAFT} -{label:TRASH} -{label:SPAM} -{subject:Re:}'
        });

        let messages = response.data.messages

        if (response.status !== 200) {
            return [];
        }

        console.log("here are  the message ", messages)
        // List the user's Gmail labels to check the connection
        //const response = await gmail.users.labels.list({ userId: 'me' });

        // if (response.status !== 200) {
        //     return res.status(response.status).send({
        //         status: false,
        //         message: response.statusText,
        //     });
        // }

        // for (const message of messages) {
        //     const messageInfo = await gmail.users.messages.get({
        //       userId: "me",
        //       id: message.id,
        //       format: "full",
        //     });
        //     const headers = messageInfo.data.payload.headers;
        //     for (const header of headers) {
        //       if (header.name === "From") {
        //         console.log(`Message from: ${header.value}`);
        //         break;
        //       }
        //     }
        //   }

        //console.log("response in your area", response.data.messages)


        const subject = "testing gmail app"
        const body = "test email is being sent to you"

        const labelName = 'Test'; // replace this with your label name
        let labelId = null;

        // Check if label exists
        const labelsResponse = await gmail.users.labels.list({
            userId: 'me',
        });
        const labels = labelsResponse.data.labels;
        for (let label of labels) {
            if (label.name === labelName) {
                labelId = label.id;
                break;
            }
        }

        // Create label if it does not exist
        if (!labelId) {
            const labelResponse = await gmail.users.labels.create({
                userId: 'me',
                requestBody: {
                    name: labelName,
                    labelListVisibility: 'labelShow',
                    messageListVisibility: 'show',
                },
            });
            labelId = labelResponse.data.id;
        }

        // Encode message as base64url
        // const messageParts = [
        //     "From: sender@example.com",
        //     "To: recipient@example.com",
        //     "Subject: Test email",
        //     "",
        //     "This is a test email"
        // ];



        //console.log(rfc822Message);

        //const encodedMessage = base64url.encode(payload);
        const repliedThreads = [];
        //loop to get the details of all messages
        for (let message of messages) {
            let messageInfo = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
            })
            console.log("message ingo as follows", messageInfo.data.threadId)

            //messageInfor.data.payload.headers
            // message ingo as follows [
            //     { name: 'Delivered-To', value: 'bndusharma2002@gmail.com' },
            //     {
            //       name: 'Received',
            //       value: 'by 2002:a05:7208:1483:b0:67:2fb9:95b8 with SMTP id c3csp291476rbf;        Wed, 12 Apr 2023 17:55:43 -0700 (PDT)'
            //     },
            //     {
            //       name: 'X-Google-Smtp-Source',
            //       value: 'AKy350biRZbLf7+Vjxjn4wtObsEIa+dNi4BQ1liTsy9MoXpOMynQAGuNFI86ZWQ44/hDdd0RPqvV'
            //     },
            //     {
            //       name: 'X-Received',
            //       value: 'by 2002:a17:906:6d86:b0:944:308f:b976 with SMTP id h6-20020a1709066d8600b00944308fb976mr717074ejt.36.1681347343087;        Wed, 12 Apr 2023 17:55:43 -0700 (PDT)'
            //     },
            //     {
            //       name: 'ARC-Seal',
            //       value: 'i=1; a=rsa-sha256; t=1681347343; cv=none;        d=google.com; s=arc-20160816;        b=NPIkV9ZsKg53M/XpnbiLLQ/qB5dDPYzGMiYKP1jfEDHnSeWN+zbDmI70GlBCCmPc+h         +jtHMljs79UeIFUK1JPx7kd7wkzBKJvvu5+y8px/2txcXep/OTDMdeP6Zu4Ui2d/avMo         uI79YMVS7DtfNFrszmaRTF6nfM7ZqGWsTXLWZhl5Z1CgbmmABTgKUiiQYVWRRhiSTL0y         Gu7+V1F46J3i3Y9dLX/f0aFMCMCnoyqXHU2HZudxvhUdMlLfazLVI7xsqHKIf/HWy4te         Tn0JXgc66/N6dfpVlkbo6qynDMbeMcG5itxqdyGrLvy32QCt51tnf+xywQaQlDa2sjEF         qDhg=='
            //     },
            //     {
            //       name: 'ARC-Message-Signature',
            //       value: 'i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s=arc-20160816;        h=message-id:list-unsubscribe-post:list-unsubscribe:feedback-id         :subject:reply-to:from:to:date:content-transfer-encoding         :mime-version:dkim-signature:dkim-signature;        bh=elpS5ZDOfMJe4Qry5PU3S9Re5QmiBJKVcAq5apLVOS0=;        b=fOaVPmJiAO65z8c1Em8Wzkv6q2QW4o8/vIxH4Q6AwI45sUDcroHW6KRAjrjuT7wj/+         HPg4RYiPvDFLY+rGEoSj7nQch+43yHkZtOkk8KH2AWPVXdKq7gTX2M67RahhG0PGfkWc         UrTwTNMIZsY5QlGYUpjquHh9XNrSB22Fi1ttIr5NYjQVpqwZ/2SfDGwvAkT4xcR0Z8I6  
            //          wtvS0o/Nw0zvsMFmRVihdvO3AW6/BzQzLLAwW9yc/dfCQCHPlLzi7KOXyLSN6T9AFRgC         6ztYG8ejH8d8NryPb7A0w3K8Bml/BpRB29liLwtSoAl/qHug2990odQe+yJdbUvAANwZ         FnzA=='
            //     },
            //     {
            //       name: 'ARC-Authentication-Results',
            //       value: 'i=1; mx.google.com;       dkim=pass header.i=@e.linkedin.com header.s=linkedin header.b=hoM1hF81;       dkim=pass header.i=@responsys.net header.s=oraclersys header.b=pPCYD9zy;       spf=pass (google.com: domain of linkedin@e.linkedin.com designates 199.7.202.92 as 
            //   permitted sender) smtp.mailfrom=linkedin@e.linkedin.com;       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=linkedin.com'
            //     },
            //     { name: 'Return-Path', value: '<linkedin@e.linkedin.com>' },
            //     {
            //       name: 'Received',
            //       value: 'from omp.e.linkedin.com (omp.e.linkedin.com. [199.7.202.92])        by mx.google.com with ESMTPS id ge24-20020a170907909800b0094e5b50d2e1si292185ejb.657.2023.04.12.17.55.42        for <bndusharma2002@gmail.com>        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);        Wed, 12 Apr 2023 17:55:43 -0700 (PDT)'
            //     },
            //     {
            //       name: 'Received-SPF',
            //       value: 'pass (google.com: domain of linkedin@e.linkedin.com designates 199.7.202.92 as permitted sender) client-ip=199.7.202.92;'      
            //     },
            //     {
            //       name: 'Authentication-Results',
            //       value: 'mx.google.com;       dkim=pass header.i=@e.linkedin.com header.s=linkedin header.b=hoM1hF81;       dkim=pass header.i=@responsys.net header.s=oraclersys header.b=pPCYD9zy;       spf=pass (google.com: domain of linkedin@e.linkedin.com designates 199.7.202.92 as permitted sender) smtp.mailfrom=linkedin@e.linkedin.com;       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=linkedin.com'
            //     },
            //     {
            //       name: 'DKIM-Signature',
            //       value: 'v=1; a=rsa-sha256; c=relaxed/relaxed; s=linkedin; d=e.linkedin.com; h=MIME-Version:Content-Type:Content-Transfer-Encoding:Date:To:From:Reply-To: Subject:Feedback-ID:List-Unsubscribe:List-Unsubscribe-Post:Message-ID; i=linkedin@e.linkedin.com; bh=elpS5ZDOfMJe4Qry5PU3S9Re5QmiBJKVcAq5apLVOS0=; b=hoM1hF81OJ+jnHqpO6aoupYrgZl6VbJ/cVqkZs40DJFy5ea3kNp12KiZLIdf/Y3t6RGLaMi7NNQS   Tti/l9Bc4UcpRh19WmZN3tuJhIXf3diAk9j0pxKFapZN35w9/JeYk/88PmfZtVgnQxnvOO81gP4H   Z5Jo/Scz3JxCBfWYAW0='
            //     },
            //     {
            //       name: 'DKIM-Signature',
            //       value: 'v=1; a=rsa-sha256; c=relaxed/relaxed; s=oraclersys; d=responsys.net; h=MIME-Version:Content-Type:Content-Transfer-Encoding:Date:To:From:Reply-To: Subject:Feedback-ID:List-Unsubscribe:List-Unsubscribe-Post:Message-ID; bh=elpS5ZDOfMJe4Qry5PU3S9Re5QmiBJKVcAq5apLVOS0=; 
            //   b=pPCYD9zycYU5wgFyYQiBNpL5Fi7hXqBkY3qOKWXxKKb6axoSVfY+UJJ9+g/mLpML3RZBY+gulNIi   wiQc7+REVxgWK+AG1LC+M744FfhZTnKiQ2nGak7XTok1vdci3gPUwP7FvT1bSdilN/WUTQxrvHCm   jrZi/QAsQuT7BeO5BZE='
            //     },
            //     {
            //       name: 'Received',
            //       value: 'by omp.e.linkedin.com id h6t9gs32bv0q for <bndusharma2002@gmail.com>; Wed, 12 Apr 2023 15:22:59 -0700 (envelope-from <linkedin@e.linkedin.com>)'
            //     },
            //     { name: 'MIME-Version', value: '1.0' },
            //     { name: 'Content-Type', value: 'text/html; charset="UTF-8"' },
            //     { name: 'Content-Transfer-Encoding', value: 'quoted-printable' },
            //     { name: 'Date', value: 'Wed, 12 Apr 2023 15:22:59 -0700' },
            //     { name: 'To', value: 'bndusharma2002@gmail.com' },
            //     { name: 'From', value: 'LinkedIn <linkedin@e.linkedin.com>' },
            //     { name: 'Reply-To', value: 'LinkedIn <donotreply@e.linkedin.com>' },
            //     {
            //       name: 'Subject',
            //       value: 'Vandana, see who else is applying for Node Js Developer'
            //     },
            //     { name: 'Feedback-ID', value: '50563:25081515:oraclersys' },
            //     {
            //       name: 'List-Unsubscribe',
            //       value: '<mailto:unsubscribe-AQpglLjHJlYQG5Wqs6DT1zgoCAjC5JtzdTzc2yoK6P9rAkmnqnzc7EmrpXqPzdSzcAoXOuSfp40Jp3EAscBXCzaoO@imh.rsys5.com?subject=List-Unsubscribe>, <https://e.linkedin.com/pub/optout/UnsubscribeOneStepConfirmAction?YES=true&_ri_=X0Gzc2X%3DAQpglLjHJlYQG5Wqs6DT1zgoCAjC5JtzdTzc2yoK6P9rAkmnqnzc7EmrpXqPzdSzcAoXOuSfp40Jp3EAscBXCzaoO&_ei_=E-vnpMJdK3gUKB0FeStv1AxMWmxZmCJ21DT_uUAApBwcpXTD-Cg0xt3gebJE-3k9i1DuLlGiyELjFcnnX181fhdWpUVIkP05BPgZMYGApHRFo0wxFLt2MT8g_VrZMjZoP2HRlkY261UUEe2CNi9LqTaZvY4z1ejgyrlxZYwb.>'
            //     },
            //     {
            //       name: 'List-Unsubscribe-Post',
            //       value: 'List-Unsubscribe=One-Click'
            //     },
            //     { name: 'X-sgxh1', value: 'IgKmkoHjuHTRRTxnuHptQJhu' },
            //     {
            //       name: 'X-rext',
            //       value: '6.interact5.EY4-kA92SFh86r8YclZ2XTPhdAyDj6sug-gXBGuji_-yZ1X6h_wm1MiWRciUG6kJ7_8Qhw'
            //     },
            //     { name: 'X-cid', value: 'linkedin.16094615' },
            //     { name: 'X-ei', value: 'EPRouodJntHN6itOpBZ5xppHE1OO830Op0' },
            //     { name: 'X-CSA-Complaints', value: 'whitelist-complaints@eco.de' },
            //     {
            //       name: 'Message-ID',
            //       value: '<0.1.2C9.C45.1D96D8D56DE2534.0@omp.e.linkedin.com>'
            //     }
            //   ]

            let headers = messageInfo.data.payload.headers
            let threadId = messageInfo.data.threadId;
            let sender = null;
            let sendEmailFrom = null
            //loop to get essential details from headers of a message and send response
            for (let header of headers) {

                if (header.name === "From") {
                    let email = null

                    //getting email like this <email id goes here> hence regex
                    const matches = header.value.match(/\<([^>]+)\>/);
                    if (matches) {
                        email = matches[1];
                        // use senderEmail as the recipient address in your message
                    } else {
                        email = header.value
                    }

                    //exclude email that contains : no reply , domain other than @gmail
                    if (/^\S+@\S+\.\S+$/.test(email) && !/no ?reply/i.test(email) && email.endsWith('@gmail.com')) {
                        sender = email;
                    } else {
                        break;
                    }
                }
                else if (header.name === "Delivered-To") {
                    sendEmailFrom = header.value
                }
                //have threadid and sender + mail not sent already to threadId 
                if (threadId && sender && !repliedThreads.includes(threadId)) {
                    const message = [
                        `From: ${sendEmailFrom}`,
                        `To: ${sender}`,
                        `Subject: ${subject}`,
                        '',
                        `${body}`
                    ];
                    try {
                        const response = await gmail.users.messages.send({
                            userId: "me",
                            requestBody: {
                                threadId: threadId,
                                raw: Buffer.from(
                                    message.join('\n'),
                                    'utf-8'
                                ).toString('base64'),
                                labelIds: [labelId], // add label ID to labelIds property
                            },
                        });

                        console.log("here is the sent response", response);
                    } catch (error) {
                        console.error("Error sending message:", error);
                    }

                    if (response.data && response.data.id) {
                        console.log("Message sent successfully!");
                    } else {
                        console.log("Error sending message!");
                    }
                    // add thread ID to repliedThreads array, keep track of email threads to which mail has been sent already
                    repliedThreads.push(threadId);
                }

            }
        }

        return res.send({ status: true, message: 'Connection to Gmail successful' });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { setConnection, mailDetails };