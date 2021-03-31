let rp = require("request-promise");
let _ = require("lodash");

function main(params) {

console.log(JSON.stringify(params))

if (params.payload.input.text !== '') {
const options = { method: 'POST',
  url: 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/<instance>/v3/identify?version=2018-05-01',
  auth: {
           'username': 'apikey',
           'password': ''
       },
headers: {
    "Content-Type":"text/plain"
},
  body: [
          params.payload.input.text
  ],
  json: true,
};

     return rp(options)
    .then(res => {
        const confidence = _.get(res, 'languages[0].confidence' );
        const language = confidence > 0.5 ? _.get(res, 'languages[0].language') : 'en';
        _.set(params, 'payload.context.skills["main skill"].user_defined["language"]', language);
        console.log(JSON.stringify(params))
        return params;
})
}
else {
    _.set(params, 'payload.context.skills["main skill"].user_defined["language"]', 'none' )
    return params
}
};
