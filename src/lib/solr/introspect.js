export function getCommand(introspect = {}, command) {
  const { spec: specs = [] } = introspect;

  for (const spec of specs) {
    const { commands = {} } = spec;

    if (commands[command]) return commands[command];
  }

  return undefined;
}
