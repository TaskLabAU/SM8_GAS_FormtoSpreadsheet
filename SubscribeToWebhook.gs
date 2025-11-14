function getEnv() {
  const props = PropertiesService.getScriptProperties();

  return {
    apiKey: props.getProperty('SERVICEM8_API_KEY'),
    callbackURL: props.getProperty('FORM_CALLBACK_URL')
  };
}

function createServiceM8WebhookSubscription() {

  const env = getEnv();

  const url = 'https://api.servicem8.com/webhook_subscriptions/event';

  // This becomes x-www-form-urlencoded automatically
  const payload = {
    event: 'form.response_created',
    callback_url: env.callbackURL
  };

  const options = {
    method: 'post',
    payload: payload,
    headers: {
      Accept: 'application/json',
      'X-API-Key': env.apiKey
      // 'Authorization': SERVICEM8_AUTH_HEADER, // uncomment + set if needed
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const bodyText = response.getContentText();

    Logger.log('Status: ' + statusCode);
    Logger.log('Body: ' + bodyText);

    // If you want to inspect JSON:
    // const data = JSON.parse(bodyText);
    // Logger.log(JSON.stringify(data, null, 2));

  } catch (err) {
    Logger.log('Error creating webhook subscription: ' + err);
  }
}
