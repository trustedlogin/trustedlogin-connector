=== TrustedLogin Connector ===
Contributors: trustedlogin
Donate link: https://www.trustedlogin.com
Tags: support, security, login
Tested up to: 6.5
Stable tag: 1.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Empower support team members to securely and easily log into client sites using TrustedLogin.

== Description ==

TrustedLogin plugin to be installed on the website of the support provider.

== Installation ==

1. Upload `plugin-name.php` to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress

== Changelog ==

= 1.1.0 on April 26, 2024 =

- **Renamed the plugin file to `trustedlogin-connector.php` - this will require you reactivate the plugin after updating!**
- Code tweaks to comply with WP Coding Standards
- Updated the textdomain to `trustedlogin-connector`
- Fixed error logging being enabled even when the setting is disabled

__Developer Notes:__

- Renamed the Composer package to `trustedlogin/trustedlogin-connector`
- Required PHP version is now 7.2 or higher
- Logging now uses `WP_Filesystem` to write the log files
- Logging now returns boolean values for success/failure and `null` for logging is disabled
- Renamed functions (deprecated functions will be removed in a future release):
  - `trustedlogin_vendor()` to `trustedlogin_connector()`
  - `trusted_login_vendor_prepare_data()` to `trustedlogin_connector_prepare_data()`
  - `trustedlogin_vendor_deactivate()` to `trustedlogin_connector_deactivate()`
- Renamed actions (deprecated actions will be removed in a future release):
  - `trustedlogin_vendor` to `trustedlogin_connector`
  - `trustedlogin_vendor_settings_saved` to `trustedlogin_connector_settings_saved`
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
