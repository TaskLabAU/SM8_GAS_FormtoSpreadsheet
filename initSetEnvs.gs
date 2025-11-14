function setupEnv() {
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    SERVICEM8_API_KEY: 'FULL_ACCESS_KEY',
    FORM_CALLBACK_URL: 'DEPLOY_WEBAPP_URL',
    SPREADSHEET_ID: 'SPREADSHEET_ID'
  });
}
