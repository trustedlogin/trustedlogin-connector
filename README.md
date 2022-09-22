# TrustedLogin Vendor

[![Built With Plugin Machine](https://img.shields.io/badge/Built%20With-Plugin%20Machine-lightgrey)](https://pluginmachine.com)
[![WordPress Tests](https://github.com/trustedlogin/vendor/actions/workflows/wordpress.yml/badge.svg)](https://github.com/trustedlogin/vendor/actions/workflows/wordpress.yml)
[![Backwards Compatiblity](https://github.com/trustedlogin/vendor/actions/workflows/compat.yml/badge.svg)](https://github.com/trustedlogin/vendor/actions/workflows/compat.yml)
[![JavaScript Tests](https://github.com/trustedlogin/vendor/actions/workflows/test-js.yml/badge.svg)](https://github.com/trustedlogin/vendor/actions/workflows/test-js.yml)


## Installation

Do not install in a directory that includes a space in the path, for example, one under "Local Sites". That will cause issues with wp.js.

IMPORTANT: You must use PHP 7.4 and composer 2.2+ when running composer. The wp.js script runs composer in Docker with the right versions.


- Git clone:
    - `git clone git@github.com:trustedlogin/vendor.git`
- Install javascript dependencies
    - `yarn`
- Install php dependencies
    - `composer install`
    - `docker run --rm -it --volume "$(pwd)":/app
prooph/composer:7.4 install`
- Create env file
    - `cp .env.example .env`
    - You will need to ask Josh and/ or Zack for values for `NGROK_WP_URL`, `NGROK_USERS`,`TL_VENDOR_ENCRYTPTION_KEY` and `NGROK_AUTH_TOKEN`.
- Setup site using `wp.js` script.

### wp.js

It is important that you use the `wp.js` script to setup the local dev site, which is served via ngork. The e2e tests assume that site is running and was setup using this script. This script should work with Node 14 or later. Josh developed it using Node 16.

- Configure WordPress Site
    - `node wp.js`
        - Installs WordPress
        - Creates admin users, as specified in `NGROK_USERS` env variable
        - Activates plugin
- Ensure that Docker is running
- Build plugin for release and ZIP
    - `yarn`
    - `node wp.js zip`

Note: if that doesn't work, make sure Docker is running and then run the following instead:

```bash
yarn build && npx --yes plugin-machine plugin build --token=notempty && npx --yes plugin-machine plugin zip --token=notempty
```

- Activate Plugin
    - `node wp.js --activate`
- Reset WordPress
    - `node wp.js ---reset`
        - Drops the database tables.

The `wp.js` script uses docker compose.


## Working With JavaScript

There is a React app, for the admin page. It is located in `/src`. We create two different builds from this app:

1. WordPress-safe JavaScript
   1. Built with [`@wordpress/scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/).
   2. We use this for the admin page.
2. "App Build"
   1. Built with [`react-scripts`](https://www.npmjs.com/package/react-scripts).
   2. We use this for the access key login link in webhooks/helpdesks.
   3. This build includes React and ReactDom and is not safe for use in normal WordPress screens.

### Commands

- Build all JavaScript and CSS for production
    - `yarn build`

#### JavaScript
- Build WordPress JavaScript for production
    - `yarn build:js`
- Build the "App Build" JavaScript for production
    - `yarn build:app`
    - This command requires that [`npx`](https://nodejs.dev/learn/the-npx-nodejs-package-runner) is installed.
    - `npx` is used to run `react-scripts`, instead of installing it in this repo and using `yarn`, in order to avoid potential conflicts with `@wordpress/scripts`.
- Start WordPress Javascript watcher and CSS watcher in parallel
    - `yarn start`
    - This is busted, open two tabs, `yarn start:css`, `yarn start:js`
- Start JS watcher only
    - `yarn start:js`
- Test changed files
    - `yarn test --watch`
- Test all files once
    - `yarn test`
    - `yarn test --ci`
- Lint JS
    - `yarn lint`

#### CSS

- Build CSS for production
    - `yarn build:css`
- Start CSS watcher for development
    - `yarn start:css`

### Tailwind CSS

The file `admin/tailwind.css` is used, with [Tailwind CSS](https://tailwindcss.com/docs/) to write CSS for the admin screens. We are using [Tailwind 3, with just in time compliation](https://tailwindcss.com/blog/just-in-time-the-next-generation-of-tailwind-css).

When Tailwind does its purge, it is configured to look for classes in PHP or JavaScript files in the admin directory only.

## Working With PHP

### Autoloader

PHP classes should be located in the "php" directory and follow the [PSR-4 standard](https://www.php-fig.org/psr/psr-4/).

The root namespace is `TrustedLoginVendor`.

### Container

```php
$container = trustedlogin_vendor();
```

### TrustedLoginService

Interactions with TrustedLogin are in the `TrustedLoginService`. You can get this service, using the container, which it needs, like this:

```php
$service = new TrustedLoginService(
    trustedlogin_vendor()
);
```
### Tests

Before doing this, you must create a ".env" file in the root of this plugin. You need to set the correct value for `TL_VENDOR_ENCRYTPTION_KEY`. Its value is saved in Zack and Josh's password managers. It is set as a Github actions environment variable. This is not needed in production.

- Run WordPress tests
    - `composer test`
    - See local development instructions for how to run with Docker.
- Run e2e Tests

The integration tests mock the SASS API. The mock data was generated using encryption keys for Zack's "Test" team. This is different from the "ngrok" team used for e2e tests.

The integration tests rely on the environment variable `TL_VENDOR_ENCRYTPTION_KEY`:

```js
{
	 /*
     *        private_key: (string) The private key used for encrypt/decrypt.
	 *        public_key: (string) The public key used for encrypt/decrypt.
	 *        sign_public_key: (string) The public key used for signing/verifying.
	 *        sign_private_key: (string) The private key used for signing/verifying.
     */
}
```


### Linter

[PHPCS](https://github.com/squizlabs/PHP_CodeSniffer) is installed for linting and [automatic code fixing](https://github.com/squizlabs/PHP_CodeSniffer/wiki/Fixing-Errors-Automatically). You can also run these commands in Docker, using wp.js.

- Run linter and autofix
    - `composer fixes`
    - `node wp.js fixes`
- Run linter to identify issues.
    - `compose sniffs`
    - `node wp.js sniffs`

- Check backwards compat
    - `compose compat`
    - `node wp.js compat`

## Local Development Environment

A [docker-compose](https://docs.docker.com/samples/wordpress/)-based local development environment is provided.

### Starting & WPCLI

- Start server
    - `docker-compose up -d`
    - If you get errors about port already being allocated, you can either:
        - Kill all containers and try again: `docker kill $(docker ps -q) && docker-compose up -d`
        - Change the port in docker-compose.yml.
- Access Site
    - [http://localhost:8200](http://localhost:8200)
- Run WP CLI command:
    - `docker-compose run wpcli wp user create admin admin@example.com --role=admin user_pass=pass`
- Beacuse the constants`WP_DEBUG` and `TRUSTEDLOGIN_DEBUG` are set to true, errors will be logged to `./trustedlogin.log`.
  - Constants are set in `docker-compose.yml`, in `services.wordpress.environment`, under `WORDPRESS_CONFIG_EXTRA`.
  - I'm not sure where this is documented, but it works. This [Stackoverflow discussion](https://stackoverflow.com/questions/53197806/how-to-get-proper-docker-compose-multiline-environment-variables-formatting) is helpful.

### PHPUnit

There is a special phpunit container for running WordPress tests, with WordPress and MySQL configured.

- Enter container
    - `docker-compose run phpunit`
- Test
    - `composer test:wordpress`
- Run tests once
  - `**docker-compose run phpunit phpunit --config=phpunit-integration.xml`

If you see prompt `Do you trust "dealerdirect/phpcodesniffer-composer-installer" to execute code and wish to enable it now? (writes "allow-plugins" to composer.json) [y,n,d,?] y` you should answer "y". This is fine.

### ngrok

The WordPress site will also be on the internets at [https://trustedlogin.ngrok.io/](https://trustedlogin.ngrok.io/). This requires setting the variable `NGROK_AUTH_TOKEN` in the .env file.

Find the auth token in [the ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken), while logged in to the TrustedLogin account. Ask Zack for access if needed.

The ngrok container has a UI for inspecting ngrok requests. It can be accessed at [http://localhost:4551/](http://localhost:4551/).

### End-To-End Testing

We use [cypress](https://cypress.io) for end to end testing (e2e) the vendor plugin, and the [e2e client](https://github.com/trustedlogin/trustedlogin-e2e-client). These tests use the production eCommerce app and Vault. These tests use an "ngrok" team. Zack can add and remove people from that team.

The [e2e client plugin](https://github.com/trustedlogin/trustedlogin-e2e-client) is installed at [https://e2e.trustedlogin.dev/]. The e2e tests in that plugin will use that site to grant access to the "ngrok" team. We can get the accessKey from that HTTP request's response. The ngrok endpoint will be serving a WordPress site using whatever version of this plugin is being tested, served at the ngrok endpoint.

Then the tests will log into the vendor site and attempt to use the plugin's setting screen to login to the client site, using the access key.


#### e2e Test Environment Variables


- `CLIENT_WP_URL`
    - URL Of client site:
    - `CLIENT_WP_URL=https://e2e.trustedlogin.dev/`
- `CLIENT_WP_PASSWORD`
    - Password of user on client site that e2e tests login as.
- `CLIENT_WP_USER`
    - Username of cf user on client site that e2e tests login as.
    - `CLIENT_WP_USER=githubactions`
- `NGROK_AUTH_TOKEN`
    - The auth token for the ngrok account
    - https://dashboard.ngrok.com/get-started/your-authtoken
- `NGROK_WP_URL`
    - NGROK_WP_URL=https://trustedlogin.ngrok.io`
    - ngrok URL for docker compose site.
    - In CI, this value should be `https://trustedlogin-ci.ngrok.io`
