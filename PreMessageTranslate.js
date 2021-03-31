let rp = require("request-promise");
let _ = require("lodash");

function main(params) {

console.log(JSON.stringify(params))

if ((params.payload.input.text !== '') && (_.get(params, 'payload.context.skills["main skill"].user_defined.language') !== 'en')) {
const options = { method: 'POST',
  url: 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/<instance>/v3/translate?version=2018-05-01',
  auth: {
           'username': 'apikey',
           'password': ''
       },
  body: { 
      text: [ 
          params.payload.input.text
          ],
          target: 'en' 
  },
  json: true 
};

     return rp(options)
    .then(res => {
        _.set(params, 'payload.context.skills["main skill"].user_defined["original_input"]', params.payload.input.text);
        params.payload.input.text = res.translations[0].translation;
        console.log(params);
        return {body: params};
})
}
else {
    _.set(params, 'payload.context.skills["main skill"].user_defined["original_input"]', params.payload.input.text )
    return {body: params}
}
};
