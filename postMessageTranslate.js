const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

let rp = require("request-promise");
let _ = require("lodash");

async function translateData(source_lang_id, target_lang_id, to_translate) {
    var translated = null;
    var lang_id = null;
    var result = null;
  
    try {
      const languageTranslator = new LanguageTranslatorV3({
        authenticator: new IamAuthenticator({ apikey: 'e6ZwlpB2aOmIIWzz6-CoVN_jT0XVWj8ltsv9auk5GTDh' }),
        serviceUrl: 'https://api.us-south.language-translator.watson.cloud.ibm.com/instances/6c929b81-0590-424c-88b3-a1fa9b424da8',
        version: '2018-05-01',
      });
  
        await languageTranslator.translate(
            {
            text: to_translate,
            source: source_lang_id,
            target: target_lang_id
            })
            .then(response => {
                translated = response.result.translations[0].translation;
                console.log("Translated -----------------------");
                console.log(JSON.stringify(translated, null, 2));
            })
            .catch(err => {
            console.log('error: ', err);
            });
    
        result = {'translated': translated}
        //console.log(result);
        return result;
    
    } catch (e) {
        return { dberror : e }
    }
  }
  

async function main(params) {
  console.log("Cloud Function postMessageTranslate started+++++++++++++++++++++");
  console.log("Before translation in POST webhook======================");
  console.log(JSON.stringify(params));

  var curr_lang = _.get(params, 'payload.context.skills["main skill"].user_defined.language');
  var lang_id = _.get(params, 'payload.context.skills["main skill"].user_defined.lang_id');
  console.log("curr_lang = ", curr_lang);
  console.log("lang_id=", lang_id);

  // translate the Welcome message if the initial value of lang_id is pre-set for the skill
  if (curr_lang == "" || curr_lang == "none" || curr_lang == null){
    curr_lang = lang_id;
    _.set(params, 'payload.context.skills["main skill"].user_defined.language', curr_lang);
  } 

  if (curr_lang !== "en" && curr_lang !== "none") 
  {
    var source_lang_id = "en";

    // retrieve the 
    var out_text = Array();
    out_text = _.get(params, 'payload.output.generic');
    console.log("out_text length = ", out_text.length);

    for (var i = 0; i < out_text.length; i++) {
        var to_translate = [params.payload.output.generic[i].text];

        // to translate
    	var myresult =  await translateData(source_lang_id, curr_lang, to_translate);

        // store the original text
        if (i==0) {
            _.set(params, 'payload.context.skills["main skill"].user_defined.original_output.0', {"text": to_translate});
        }else if (i==1) {
            _.set(params, 'payload.context.skills["main skill"].user_defined.original_output.1', {"text": to_translate});
        } else if (i==2) {
            _.set(params, 'payload.context.skills["main skill"].user_defined.original_output.2', {"text": to_translate});
        }

        // change the output to the translated text
        params.payload.output.generic[i].text = myresult.translated;
    }

    console.log("After translation in POST webhook=================");
    console.log(JSON.stringify(params));

    return { body: params };

  } else {
    return { body: params };
  }
}
