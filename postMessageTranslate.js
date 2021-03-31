let rp = require("request-promise");
let _ = require("lodash");

function main(params) {

console.log(JSON.stringify(params))

if ((_.get(params, 'payload.context.skills["main skill"].user_defined.language') !== 'en') && (_.get(params, 'payload.context.skills["main skill"].user_defined.language') !== 'none')) {
const options = { method: 'POST',
  url: 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/<instance>/v3/translate?version=2018-05-01',
  auth: {
           'username': 'apikey',
           'password': ''
       },
  body: { 
      text: [ 
          params.payload.output.generic[0].text
          ],
          target: params.payload.context.skills["main skill"].user_defined.language 
  },
  json: true 
};

     return rp(options)
    .then(res => {
        _.set(params, 'payload.context.skills["main skill"].user_defined["original_output"]', params.payload.output.generic[0].text);
        params.payload.output.generic[0].text = res.translations[0].translation;
        console.log(params);
        return {body:params};
})
}

else {
    return {body:params}
}
};
