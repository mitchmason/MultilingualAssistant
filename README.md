# README


This repo showcases how to create a multilingual assistant using pre and post message webhooks.

These samples were originally built using IBM Cloud Functions

We initially designed it to run language identification and pre-message translation as a sequence of two cloud functions in a row, and the identified language is saved as a context variable and is reused in the post-message translation as well.

We have two samples now:

   Identify&Translate.js combines both of these into one code sample
   IdentfyLanguage.js only identifies the language, and is meant to be used in sequence, but it may come in handy to have this separate if you like.
   preMessageTranslate take the langauge identified as a paramter and translates accordingly. It is up to you which method you like

We also have two methods to respond:

   Use the postMessageTranslate to automatically translate the output.text object This is reliable when you have a relatively simple domain. In some cases, you will want to handwrite the responses. You can use Multiple Conditioned Responses to do this in your dialog nodes, however, we have found it can be better to keep the responses outside of dialog so other, less expert uses can simply do the translation. For this, use method 2:
    databaseOrTranslate will pull the response from a Cloudant database filled with answers based on the rows automatically created according to dialog_node_id. If no response is found in the database then it will use method 1 to automatically translate.

**Instructions:**

   Copy each JS file into its own cloud function
   Optionally create a sequence where languageIdentification runs first, followed by preMessageTranslation
   Use this new sequence as your pre-message webhook in Watson Assistant settings 3a. Alternatively, just use the new single file for identifying and translating
   Use the postMessageTranslation action as your post-message webhook in Watson Assistant settings 4a. If desired, use the database dump script to populate your Cloudant db based on your dialog skill, and fill out the corresponding objects for each dialog node and langauge as needed.

**Known gaps:**

   These scripts only support simple text responses. To update for disambiguation suggestions, options, etc., you will need to simply update the objects that get examined and translated. Instead of output.generic.text you would look for output.generic.suggestions and output.generic.options
   There is no easy way to translate context variables at runtime when using the database option to hand-write translations. If context variables are needed in your response, we suggest using the automatic translations
   There is some nuance with slot collection and knowing which response to look up, as a slot requires the overall dialog node, handler, and slot IDs, so knowing which response to lookup has some complexity. We suggest relying on automatic translation for this as well.
    
**Troubleshooting:**
    During the execution or test of your multilingual chatbot, it is good to have these tips if you are stuck:
    - If you are developing your webhooks as cloud functions its good to see the logs in your console: 
        ibmcloud fn property set --namespace "NAMESPACE" 
        ibmcloud fn activation poll
        Note: you can also go to the activation dashboard of your cloud functions to see the logs without running the command line
    - Disable Autocorrection for Multilingual Input, this will avoid  auto-correcting some words in other languages that break the translation.
    - Check the Assistant Analytics section to check the logs. There you can see what is received by the Post-message webhook as input from the pre-message webhook.
    - if the output message is one word in uppercase like "WELCOME" it will not be translated by Watson Language Translator.
    - if the input of the user is only one word or a short sentence, the confidence of the translator service is going to be low in most cases, so be aware to handle logic in your cloud function to retain the best identified language recognized in the past utterances.
    - if you use a cloud function sequence, make sure that the last cloud function is returning with the JSON format:   return { body: params }
    - The post-webhook code doesn't handle slots, but you can improve the code to support it. Right now if the answer unit is not found, the post webhook is going to translate the output from the watson assistant dialog to the user using the last identified language, just like pattern 1.

