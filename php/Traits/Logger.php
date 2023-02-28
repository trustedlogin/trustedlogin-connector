<?php

namespace TrustedLogin\Vendor\Traits;

use DateTime;
use TrustedLogin\Vendor\SettingsApi;

trait Logger
{

    /**
     * The random hash used for log location
     * @var string
     */
    private $hash;

    /**
     * Use trustedlogin_vendor()->log( 'message', __METHOD__ );
     */
	public function log( $message,$method, $logLevel = 'info' , $context = [] )
	{

		$context  = (array) $context;
		$logLevel = strtolower( is_string( $logLevel ) ? $logLevel : 'info' );
		$message  = "[{$this->getTimestamp()}] [{$logLevel}] {$message}";

		if ( $context ) {
			$message .= ' ' . json_encode( $context, JSON_PRETTY_PRINT );
		}

		$logFileName = $this->getLogFileName();

		if ( ! file_exists( $logFileName ) ) {
			touch( $logFileName );
		}

		$file = fopen( $logFileName, "a" );

		fwrite( $file, "\n" . $message );
		fclose( $file );
	}

 	/**
     * Formats the message for logging.
     *
     * @param  string $level   The Log Level of the message
     * @param  string $message The message to log
     * @param  array  $context The context
	 *
	 * @see https://github.com/katzgrau/KLogger/blob/master/src/Logger.php#L260-L294
     * @return string
     */
    protected function formatMessage($level, $message, $context)
    {
	    $message = "[{$this->getTimestamp()}] [{$level}] {$message}";
	    if ( $context ) {
		    $message .= ' ' . json_encode( $context, JSON_PRETTY_PRINT );
	    }

	    return $message . PHP_EOL;

    }

	/**
     * Gets the correctly formatted Date/Time for the log entry.
     *
     * PHP DateTime is dump, and you have to resort to trickery to get microseconds
     * to work correctly, so here it is.
     *
	 * @see https://github.com/katzgrau/KLogger/blob/master/src/Logger.php#L296-L311
	 *
     * @return string
     */
    private function getTimestamp()
    {
        $originalTime = microtime(true);
        $micro = sprintf("%06d", ($originalTime - floor($originalTime)) * 1000000);
        $date = new DateTime(date('Y-m-d H:i:s.'.$micro, $originalTime));

        return $date->format('Y-m-d H:i:s');
    }

	/**
	 * Returns a random hash for the log file.
	 *
	 * @return string Random hash.
	 */
	private function getHash() {

		if ( $this->hash ) {
			return $this->hash;
		}

		$hash = get_option( SettingsApi::LOG_LOCATION_SETTING_NAME, false );

		if( $hash ) {
			$this->hash = $hash;
			return $hash;
		}

		$this->hash = hash( 'sha256', uniqid( rand(), true ) );

		update_option(SettingsApi::LOG_LOCATION_SETTING_NAME, $this->hash );

		return $this->hash;
	}

    /**
     * @see https://github.com/trustedlogin/vendor/issues/83
     */
    private function getLogFileName(){

		//Use plugin dir in development.
        if( defined( 'TRUSTEDLOGIN_DEBUG') && TRUSTEDLOGIN_DEBUG ) {
            return dirname( __FILE__, 3 ) . '/trustedlogin-vendor.log';
        }

		$hash = $this->getHash();

		//If we have a hash, use it.
		if( ! $hash ) {
			error_log( 'TrustedLogin: Unable to get a random hash for the log file.' );
			return dirname( __FILE__, 3 ) . '/trustedlogin-vendor.log';
		}

		$upload_dir = wp_upload_dir();

		//else use a upload dir + random hash.
        return trailingslashit( $upload_dir['basedir'] ) . 'trustedlogin-vendor-' . $hash . '.log';
    }


}
