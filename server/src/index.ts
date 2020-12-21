import { Command, flags } from "@oclif/command";
import { run } from "./server";

class Axd extends Command {
  static description = "Run Actyx diagnostics";

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    host: flags.string({
      char: "h",
      description: "host address to bind to",
      default: "localhost",
    }),
    port: flags.integer({
      char: "n",
      description: "port to bind to",
      default: 1234,
    }),
  };

  static args = [{ name: "file" }];

  async run() {
    const { args, flags } = this.parse(Axd);

    await run(flags.host, flags.port);
  }
}

export = Axd;
