=== TrustedLogin Connector ===
Contributors: trustedlogin
Donate link: https://www.trustedlogin.com
Tags: support, security, login
Tested up to: 6.6
Stable tag: 1.2.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Empower support team members to securely and easily log into client sites using TrustedLogin.

== Description ==

## Use TrustedLogin to log into your customers’ sites securely and easily

Do you provide support for WordPress websites? TrustedLogin allows you to log into your customers’ sites securely. The TrustedLogin Connector plugin connects your WordPress site to the [TrustedLogin](https://www.trustedlogin.com) service.

### How it works

1. [Create an account on TrustedLogin.com](https://app.trustedlogin.com)
1. Install the TrustedLogin Connector plugin on your WordPress site
1. Integrate the TrustedLogin SDK into your code

Your users will then be able to grant you access to their site and provide you with an Access Key. With this plugin, you can log into their site using the Access Key.

== Frequently Asked Questions ==

### Do I need to have a TrustedLogin account?

Yes, you need to have a TrustedLogin account to use this plugin. You can create an account at [TrustedLogin.com](https://app.trustedlogin.com).

### Does it require any special configuration?

Yes, you need to have the TrustedLogin SDK integrated into your code. You can find the SDK and instructions on how to integrate it in the [TrustedLogin documentation](https://docs.trustedlogin.com).

### What are the Terms of Service?

By using TrustedLogin, you agree to the [TrustedLogin Terms of Service](https://www.trustedlogin.com/authorized-user-terms/).

### What is the Privacy Policy?

By using TrustedLogin, you agree to the [TrustedLogin Privacy Policy](https://www.trustedlogin.com/privacy-policy/).

== Installation ==

1. Upload this plugin to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress

== Changelog ==

= 1.2.1 on September 8, 2024 =

* Updated the plugin readme to point to the [TrustedLogin Privacy Policy](https://www.trustedlogin.com/privacy-policy/) and [Terms of Service](https://www.trustedlogin.com/authorized-user-terms/).
* Code formatting improvements
* Security improvements

= 1.2 on August 26, 2024 =

- Added support for free trials
- Added a loading indicator when adding, updating, or deleting a team
- Improved handling errors returned from TrustedLogin app
- Fixed inability to connect to a team using the dropdown when there are multiple teams
- Fixed error when creating a file that prevents directory browsing in the log directory

= 1.1.1 on April 30, 2024 =

- Added `index.html` files to log directories to prevent potential browsing
- Deprecated `trustedlogin/vendor/customers/licenses' hook in favor of `trustedlogin/connector/customers/licenses`

= 1.1.0 on April 30, 2024 =

- **Renamed the plugin file to `trustedlogin-connector.php` - this will require you reactivate the plugin after updating!**
- Updated code to better comply with WP Coding Standards
- Fixed error logs being written when the setting is disabled
- Error logs are now deleted when disabling the Debug Logging setting

__Developer Notes:__

- Required PHP version is now 7.2 or higher
- Logging now uses `WP_Filesystem` to write the log files
- Logging now returns boolean values for success/failure and `null` for logging is disabled
- Updated the translation textdomain to `trustedlogin-connector`
- Renamed the Composer package to `trustedlogin/trustedlogin-connector`
- Renamed functions (deprecated functions will be removed in a future release):
  - `trustedlogin_vendor()` to `trustedlogin_connector()`
  - `trusted_login_vendor_prepare_data()` to `trustedlogin_connector_prepare_data()`
  - `trustedlogin_vendor_deactivate()` to `trustedlogin_connector_deactivate()`
- Renamed hooks (deprecated actions will be removed in a future release):
  - `trustedlogin_vendor` to `trustedlogin_connector`
  - `trustedlogin_vendor_settings_saved` to `trustedlogin_connector_settings_saved`
  - `trustedlogin/vendor/encryption/keys-option` to `trustedlogin/connector/encryption/keys-option`
- Removed the following methods, since they are not needed (they are now handled by the JS `AccessKeyForm` component since 0.13.0):
  - `TrustedLoginService::handleMultipleSecretIds()`
  - `TrustedLoginService::maybeRedirectSupport()`

A full list of changes can be found in the [TrustedLogin Connector GitHub repository](https://github.com/trustedlogin/trustedlogin-connector/releases/tag/v1.1.0).

= 1.0.0 on January 26, 2024 =

- Renamed the plugin to TrustedLogin Connector
- Added checks to make sure the Account ID is a number
- Fixed resetting teams not working

= 0.15.1 on September 27, 2023 =

- Disabled autocomplete on the Access Key input field
- Added minimum and maximum length values to the Access Key input, helping prevent invalid Access Key submission
- Fixed PHP warning
- Fixed incorrect method usage when resetting teams (thanks @danieliser)

= 0.15.0 on September 4, 2023 =

- Added support for the FreeScout help desk. Requires installing the [FreeScout TrustedLogin Module](https://github.com/trustedlogin/freescout-module)
- Added support for logging into multiple sites when the same Access Key is used on multiple sites (when a license key is shared)
- Set required length for an Access Key when submitting the form
- Added an error notifying when the Access Key is invalid
- Updated to display the Site Access menu item when the user has a support role
- Delete the log file when Reset All is performed
- Refactored the help desk provider classes

= 0.14.0 on May 25, 2023 =

- Improved experience when there are multiple URLs using the same Access Key: each matching site will be presented as a clickable link
- Implemented an additional check to ensure users attempting login have the necessary roles defined in the plugin settings prior to enabling login
- Added notice that logging is not changeable when the `TRUSTEDLOGIN_DEBUG` constant is defined
- Obfuscated log file location for enhanced security
- Implemented the ability to reset the encryption keys for a site
- Removed AuditLog.php until it's implemented
- Added missing `index.php` files to prevent website crawling
- Added exception handling for `TypeError` and `SodiumException` errors in the encryption class
- Fixed spinner not displaying upon Access Key submission
- Fixed global logging settings not saving
