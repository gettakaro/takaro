export function Commands({ commands }) {
  if (!commands || !commands.length) return null;
  return (
    <>
      <h4>Commands</h4>
      <ul>
        {commands.map((command) => (
          <li>
            /{command.name} - {command.helpText}
          </li>
        ))}
      </ul>
    </>
  );
}

export function Hooks({ hooks }) {
  if (!hooks || !hooks.length) return null;
  return (
    <>
      <h4>Hooks</h4>
      <ul>
        {hooks.map((hook, hookIndex) => (
          <li key={hookIndex}>
            {hook.name} - Regex: {hook.regex}, Event Type: <code>{hook.eventType}</code>
          </li>
        ))}
      </ul>
    </>
  );
}

export function CronJobs({ cronJobs }) {
  if (!cronJobs || !cronJobs.length) return null;
  return (
    <>
      <h4>Cron Jobs</h4>
      <ul>
        {cronJobs.map((job, jobIndex) => (
          <li key={jobIndex}>
            {job.name} - Temporal Value: {job.temporalValue}
          </li>
        ))}
      </ul>
    </>
  );
}

export function Config({ configSchema }) {
  // configSchema is a jsonSchema object
  // Parse it and display pretty:
  const schema = JSON.parse(configSchema);
  const properties = schema.properties;

  if (!properties) return null;

  return (
    <>
      <h4>Config variables</h4>
      <ul>
        {Object.keys(properties).map((key, index) => (
          <li key={index}>
            <b>{key}</b> <small>{properties[key].type} </small> - {properties[key].description}
          </li>
        ))}
      </ul>
    </>
  );
}
