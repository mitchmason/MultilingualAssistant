/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  * 
  *         {
        "payload" : { 
          "output" : 
            {  
                "generic" : 
                [
                        {
                          "response_type": "text",
                          "text": "WELCOME"
                        }
                 ]
              }
          },
             "context": {
      
      "skills": {
        "main skill": {
          
          "user_defined": {
            "language": "es"
          }
        }
      }
    }
        }
  *
  */
let rp = require("request-promise");
let _ = require("lodash");
​
function main(params) {
  console.log("Input Params from pre-webhook");
  console.log(JSON.stringify(params));
​
  const CloudantSDK = require("@cloudant/cloudant");
​
  const cloudant = new CloudantSDK({
    url: "<CLOUDANT_URL>",
    plugins: { iamauth: { iamApiKey: "<CLOUDANT_APIKEY>" } },
  });
​
  var defaultDialogLanguageCode = "en";
  const databaseName = "mydb";
​
  //We are going to check first in the AnswerStore DB if the text is there, otherwise we can translate it
  if (
    params.payload.output.generic[0].text !== "" &&
    params.payload.context.skills["main skill"].user_defined &&
    params.payload.context.skills["main skill"].user_defined.language !==
      defaultDialogLanguageCode &&
    params.payload.context.skills["main skill"].user_defined.language !== "none"
  ) {
    var languageCode =
      params.payload.context.skills["main skill"].user_defined.language ||
      defaultDialogLanguageCode; //language code from the WLT identify OR by default "en" English language code to search for
    var searchKey = params.payload.output.debug.nodes_visited[0].dialog_node;
    console.log("searchkey " + searchKey);
    return new Promise(function (resolve, reject) {
      cloudant
        .use(databaseName)
        .get(searchKey)
        .then((answerUnit) => {
          if (answerUnit) {
            console.log("Returning the answer from the DB using the search key: " + searchKey);
            console.log(answerUnit.answerText);
            if (languageCode == "es") {
              params.payload.output.generic[0].text = answerUnit.es;
            } else if (languageCode == "fr") {
              params.payload.output.generic[0].text = answerUnit.fr;
            } else {
              //default to "en"
              params.payload.output.generic[0].text = answerUnit.en;
            }
​
            const response = {
              body: params,
            };
            resolve(response);
          }
        })
        .catch((error) => {
          console.log("error from DB " + error);
​
          // If there is no data from the DB, we translate the output using WLT
          const options = {
            method: "POST",
            url:
              "https://<WATSON_LANGUAGE_TRANSLATOR_URL>/instances/<YOUR_INSTANCE_ID>/v3/translate?version=2018-05-01",
            auth: {
              username: "apikey",
              password: "<WATSON_LANGUAGE_TRANSLATOR_APIKEY>",
            },
            body: {
              text: [params.payload.output.generic[0].text],
              target: params.payload.context.skills["main skill"].user_defined.language,
            },
            json: true,
          };
          resolve(
            rp(options).then((res) => {
              console.log(
                "Translating Output to " +
                  params.payload.context.skills["main skill"].user_defined.language
              );
              params.payload.context.skills["main skill"].user_defined["original_output"] =
                params.payload.output.generic[0].text;
              params.payload.output.generic[0].text = res.translations[0].translation;
              const response = {
                body: params,
              };
              return response;
            })
          );
        });
    });
  } else {
    const response = {
      body: params,
    };
    return response;
  }
}
