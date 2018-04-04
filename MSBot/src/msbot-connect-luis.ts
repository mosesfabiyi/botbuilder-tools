import * as program from 'commander';
import * as chalk from 'chalk';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectLuisArgs extends ILuisService {
    bot: string;
    secret: string;
}

program
    .name("msbot connect luis")
    .description('Connect the bot to a LUIS application')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appId <appid>', 'AppId for the LUIS App')
    .option('-v, --version <version>', 'version for the LUIS App, (example: v0.1)')
    .option('--authoringKey <authoringkey>', 'authoering key for authoring LUIS models via the authoring API')
    .action((cmd, actions) => {

    });

let args = <ConnectLuisArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectLuisArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot)
            .then(processConnectLuisArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectLuisArgs(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (args.secret) {
        config.cryptoPassword = args.secret;
    }

    if (!args.hasOwnProperty('name'))
        throw new Error("Bad or missing name");

    if (!args.appId)
        throw new Error("Bad or missing appId");

    if (!args.version)
        throw new Error("missing version");

    if (!args.authoringKey)
        throw new Error("missing authoringKey");

    // add the service
    config.connectService(<ILuisService>{
        type: ServiceType.Luis,
        name: args.name,
        id: args.appId,
        appId: args.appId,
        version: args.version,
        authoringKey: config.encryptValue(args.authoringKey)
    });
    await config.Save();
    return config;
}