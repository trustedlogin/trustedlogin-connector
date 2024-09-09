<?php

namespace TrustedLogin\Vendor;

use TrustedLogin\Vendor\Traits\Logger;

/**
 * When in debug mode, log all errors to our log.
 *
 * @see https://github.com/inpsyde/Wonolog/blob/master/src/PhpErrorController.php
 */
final class ErrorHandler {

	use Logger;

	/**
	 * Register error handlers
	 *
	 * @see https://github.com/inpsyde/Wonolog/blob/b1af1bcc8bdec2bd153a323bbbf507166c9c8e1b/src/Controller.php#L103-L106
	 */
	public static function register() {

		$controller = new self();
		register_shutdown_function( array( $controller, 'onFatal' ) );
		set_error_handler( array( $controller, 'onError' ), E_ALL | E_STRICT );
		set_exception_handler( array( $controller, 'onException' ) );
	}
	/**
	 * Error handler.
	 *
	 * @param  int        $num
	 * @param  string     $str
	 * @param  string     $file
	 * @param  int        $line
	 * @param  array|null $context
	 *
	 * @return bool
	 */
	public function onError( $num, $str, $file, $line, $context = array() ) {
		$this->log( implode( ' ', array( $num, $str, "$file:$line" ) ), __METHOD__, 'error', $context );
		return false;
	}

	/**
	 * Uncaught exception handler.
	 *
	 * @param  \Throwable $e
	 *
	 * @throws \Throwable
	 */
	public function onException( $e ) {

		$this->onError( $e->getCode(), $e->getMessage(), $e->getFile(), $e->getLine() );

		throw $e;
	}

	/**
	 * Checks for a fatal error, work-around for `set_error_handler` not working with fatal errors.
	 */
	public function onFatal() {

		$last_error = error_get_last();
		if ( ! $last_error ) {
			return;
		}

		$error = array_merge(
			array(
				'type'    => -1,
				'message' => '',
				'file'    => '',
				'line'    => 0,
			),
			$last_error
		);

		$fatals = array(
			E_ERROR,
			E_PARSE,
			E_CORE_ERROR,
			E_CORE_WARNING,
			E_COMPILE_ERROR,
			E_COMPILE_WARNING,
		);

		if ( in_array( $error['type'], $fatals, true ) ) {
			$this->onError( $error['type'], $error['message'], $error['file'], $error['line'] );
		}
	}
}
