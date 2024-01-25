=== TrustedLogin Connector ===
Contributors: trustedlogin
Donate link: https://www.trustedlogin.com
Tags: support, security, login
Tested up to: 6.3.1
Stable tag: 0.15.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Empower support team members to securely and easily log into client sites using TrustedLogin.

== Description ==

TrustedLogin plugin to be installed on the website of the support provider.

== Installation ==

1. Upload `plugin-name.php` to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress

== Changelog ==

= develop =

- Added checks to make sure the Account ID is a number

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
