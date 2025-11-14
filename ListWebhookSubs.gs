function getEnv() {
  const props = PropertiesService.getScriptProperties();

  return {
    apiKey: props.getProperty('SERVICEM8_API_KEY'),
  };
}

function getWebhookSubscriptions() {
  const url = 'https://api.servicem8.com/webhook_subscriptions';
  const env = getEnv();

  if (!env.apiKey) {
    Logger.log('No SERVICEM8_API_KEY set in Script Properties');
    return;
  }

  const options = {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'X-API-Key': env.apiKey
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);

  Logger.log('Status: ' + response.getResponseCode());
  Logger.log('Raw body: ' + response.getContentText());

  let data;
  try {
    data = JSON.parse(response.getContentText());
    Logger.log('Parsed JSON: ' + JSON.stringify(data, null, 2));
  } catch (e) {
    Logger.log('JSON parse error: ' + e);
    return;
  }

  return data;
}
