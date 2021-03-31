/**
 *
 * main() will be run when you invoke this action
 *
 * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
 */
let rp = require("request-promise");
let _ = require("lodash");
​
function main(params) {
  if (params.payload.input.text !== "") {
    const options = {
      method: "POST",
      url:
        "https://<WATSON_LANGUAGE_TRANSLATOR_URL>/instances/<YOUR_INSTANCE_ID>/v3/identify?version=2018-05-01",
      auth: {
        username: "apikey",
        password: "<WATSON_LANGUAGE_TRANSLATOR_APIKEY>",
      },
      headers: {
        "Content-Type": "text/plain",
      },
      body: [params.payload.input.text],
      json: true,
    };
    return rp(options).then((res) => {
      var defaultDialogLanguageCode = "en";
​
      const confidence = _.get(res, "languages[0].confidence");
      console.log("confidence " + confidence);
      const language =
        confidence > 0.5 ? _.get(res, "languages[0].language") : defaultDialogLanguageCode;
      _.set(params, 'payload.context.skills["main skill"].user_defined["language"]', language);
​
      if (res.languages[0].language !== defaultDialogLanguageCode) {
        const options = {
          method: "POST",
          url:
            "https://<WATSON_LANGUAGE_TRANSLATOR_URL>/instances/<YOUR_INSTANCE_ID>/v3/translate?version=2018-05-01",
          auth: {
            username: "apikey",
            password: "<WATSON_LANGUAGE_TRANSLATOR_APIKEY>",
          },
          body: {
            text: [params.payload.input.text],
            target: defaultDialogLanguageCode,
          },
          json: true,
        };
        return rp(options).then((res) => {
          console.log("PRE-Translate - translating");
          params.payload.context.skills["main skill"].user_defined["original_input"] =
            params.payload.input.text;
          params.payload.input.text = res.translations[0].translation;
          console.log(JSON.stringify(params));
          // const result = {
          //   body: params,
          // };
          return { params };
        });
      } else {
        console.log(JSON.stringify(params));
        // const result = {
        //   body: params,
        // };
        return { params };
      }
    });
  } else {
    params.payload.context.skills["main skill"].user_defined["language"] = "none";
    // const result = {
    //   body: params,
    // };
    return { params };
  }
}
