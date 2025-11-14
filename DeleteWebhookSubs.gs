function getEnv() {
  const props = PropertiesService.getScriptProperties();

  return {
    apiKey: props.getProperty('SERVICEM8_API_KEY'),
  };
}

function deleteWebhookSubscription() {
  const url = 'https://api.servicem8.com/webhook_subscriptions';
  const env = getEnv();

  const payload = 'event=form.response_created';  
  // same as new URLSearchParams({ event: 'form.response_created' })

  const options = {
    method: 'delete',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload,
    headers: {
      Accept: 'application/json',
      // Add required ServiceM8 auth:
      'X-API-Key': env.apiKey
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const body = response.getContentText();

  Logger.log('Status: ' + response.getResponseCode());
  Logger.log('Body: ' + body);

  try {
    const json = JSON.parse(body);
    Logger.log(JSON.stringify(json, null, 2));
    return json;
  } catch (e) {
    Logger.log('Non-JSON response or parse error: ' + e);
    return body;
  }
}
