#!/usr/bin/env node

//Load environment variables
require("dotenv").config();

const shell = require("shelljs");

//console.log(process.env) // remove this after you've confirmed it working

const { NGROK_WP_URL, NGROK_USERS, CLIENT_WP_URL } = process.env;
if (!NGROK_WP_URL || !NGROK_USERS || !CLIENT_WP_URL) {
  console.log({ NGROK_WP_URL, NGROK_USERS, CLIENT_WP_URL });
  throw Error("Missing environment variables");
}

/*
 * Log to console or shell
 */
const log = (...args) => {
  // shell.echo(...args);
  console.log(...args);
};

/**
 * Exit with success code
 */
const exitSuccess = (message = "Succesful") => {
  log(message);
  //barrel roll
  shell.exit(0);
};

/**
 * Exit with error code
 */
const exitError = (errorCode = 1, message = "Exitting With Error!") => {
  log(message);
  shell.exit(errorCode);
};

/**
 * Run a command
 */
const runCommand = async (command) => {
  return new Promise(async (resolve, reject) => {
    //Use composer function for composer commands
    if (command.startsWith("composer")) {
      try {
        await composer(command);
        resolve();
      } catch (error) {
        reject(error);
      }
    }
    //Pass all other commands to shell
    if (shell.exec(command).code !== 0) {
      reject();
    } else {
      resolve();
    }
  });
};

/**
 * Run a WP CLI command in Docker containr
 */
const wp = async (command) => {
  command = `docker-compose run wpcli wp ${command}`;
  return runCommand(command);
};

/**
 * Install WordPress for the WordPress site.
 */
const install = async ({ url, title }) => {
  log("Installing WordPress");
  //This user is intentionally fake
  await wp(
    `core install --url=${url} --title="${title}" --admin_user=admin0 --admin_email=something@example.com`
  );
};

/**
 * Create an admin user
 */
const createAdminUser = async ({ username, email, password }) => {
  log("Creating admin user");
  await wp(
    `user create ${username} ${email} --role=administrator --user_pass=${password}`
  ).catch(() => {
    log("Admin user already exists");
    log("This is OK");
  });
};

//Reset the WordPress Database
const resetWordPress = async () => {
  log("Resetting WordPress");
  await wp("db reset --yes");
};

//Create all users in the NGROK_USERS env var
const createUsers = async () => {
  await JSON.parse(NGROK_USERS).forEach(async (user) => {
    await createAdminUser(user);
  });
};

//Activate {slug} plugin
//activatePlugin({ slug: "trustedlogin-connector" })
//activatePlugin({ slug: "akismet" })
const activatePlugin = async ({ slug }) => {
  log("Activating plugin");
  await wp(`plugin activate ${slug}`);
};

//Run a composer command in Docker container
const composer = async (command) => {
  if (command.startsWith("composer")) {
    //remove "composer" from command
    command = command.substring("composer".length);
  }
  //See: https://github.com/prooph/docker-files/tree/master/composer
  //Removed -it flag to make it work.
  command = `docker run --rm  --volume ${pluginDir}:/app prooph/composer:${phpVersion} ${command}`;
  info(`Running composer command: ${command}`);
  return runCommand(command);
};

//Run e22 test
//e2eTest({ browser: "chrome" })
//e2eTest({ browser: "firefox" })
const e2eTest = async ({ browser }) => {
  if (!["chrome", "firefox"].includes(browser)) {
    throw Error("Invalid browser");
  }
  await runCommand(`docker-compose run e2e-${browser}`);
};

//Build for prod and make zip
const buildZip = async () => {
  return runCommand(`yarn build`) //Build CSS/ JS using host machine
    .then(() => {
      //This will run optimzed composer install in the docker container
      runCommand(
        `npx --yes plugin-machine plugin build --token=anything-works-for-this`
      ).then(() => {
        //Make a zip of the right files
        runCommand(
          `npx --yes plugin-machine plugin zip --token=anything-works-for-this`
        );
      });
    })
    .catch(exitError);
};

/**
 * This function is the CLI
 *
 * It is a function, so we can use await inside of it.
 */
async function main() {
  //Run sub-command?
  if (process.argv.length >= 3) {
    const arg3 = process.argv.length >= 4 ? process.argv[3] : null;
    switch (process.argv[2]) {
      case "zip":
        await buildZip().catch(exitError).then(exitSuccess("Zip file created"));
        break;
      case "kill":
        runCommand("docker kill $(docker ps -q)")
          .then(exitSuccess)
          .catch(exitError);
        break;
      case "test":
        e2eTest({ browser: arg3 ?? "chrome" })
          .then(exitSuccess)
          .catch(exitError);
        break;
      case "--activate":
        activatePlugin({
          slug: "trustedlogin-connector",
        })
          .then(exitSuccess)
          .catch(exitError);
        break;
      case "--reset":
        resetWordPress().then(exitSuccess).catch(exitError);
        break;
      case "compat":
        runCommand(`composer compat`).then(exitSuccess).catch(exitError);
        break;
      case "sniffs":
        runCommand(`composer sniffs`).then(exitSuccess).catch(exitError);
        break;
      case "fixes":
        runCommand(`composer fixes`).then(exitSuccess).catch(exitError);
        break;
      default:
        break;
    }
  }
  //By default set everything else up
  else {
    createUsers().then(() => {
      log("Done");
    });
  }
}
main();
