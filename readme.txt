=== TrustedLogin Vendor ===
Contributors: trustedlogin
Donate link: https://www.trustedlogin.com
Tags: support, security, login
Tested up to: 6.2.2
Stable tag: 0.14.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Here is a short description of the plugin.  This should be no more than 150 characters.  No markup here.

== Description ==

TrustedLogin plugin to be installed on the website of the support-provider ("vendor").

== Installation ==

1. Upload `plugin-name.php` to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress

== Changelog ==

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
