<?php
/**
 * Class LoggerTest
 *
 * @package Tl_Support_Side
 */
namespace TrustedLogin\Vendor\Tests;

use TrustedLogin\Vendor\Plugin;
use TrustedLogin\Vendor\Encryption;

/**
 * Tests for Logger Trait.
 * @since 1.1
 */
class LoggerTest extends \WP_UnitTestCase
{

	/** @var Plugin */
	private $TL;

	/**
	 * LoggingTest constructor.
	 */
	public function setUp(): void
	{
		$this->TL = new Plugin(new Encryption());
	}

	/**
	 * @covers \TrustedLogin\Vendor\Plugin::init_wp_filesystem
	 * @since 1.1
	 */
	public function test_init_wp_filesystem()
	{
		global $wp_filesystem;

		$wp_filesystem = null;

		$this->assertEquals(null, $wp_filesystem);

		$method = new \ReflectionMethod('TrustedLogin\Vendor\Plugin', 'init_wp_filesystem');
		$method->setAccessible(true);
		$method->invoke($this->TL);

		$this->assertInstanceOf('WP_Filesystem_Base', $wp_filesystem, 'init_wp_filesystem should return a WP_Filesystem_Base object');
	}

	/**
	 * @covers \TrustedLogin\Vendor\Plugin::log
	 * @since 1.1
	 */
	public function test_log()
	{
		$microtime = microtime(false);
		$message = 'Random message: ' . $microtime;
		$method = 'method_' . wp_rand();
		$logLevel = 'info';
		$context = [ 'test_context' => [ 'nested' => wp_rand() ] ];

		$logFileName = $this->TL->getLogFileName();

		$logged = $this->TL->log($message, $method, $logLevel, $context);
		$this->assertNull($logged);

		// Enable logging, which is disabled by default.
		trustedlogin_connector()->getSettings()->setGlobalSettings(['error_logging' => true ]);

		$logged = $this->TL->log($message, $method, $logLevel, $context);
		$this->assertTrue($logged);
		$this->assertFileExists($logFileName);

		$log_content = file_get_contents($logFileName); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		$this->assertStringContainsString($message, $log_content);
		$this->assertStringContainsString(wp_json_encode($context, JSON_PRETTY_PRINT), $log_content);

		// Disable logging again, just to be sure.
		trustedlogin_connector()->getSettings()->setGlobalSettings(['error_logging' => false ]);

		$logged = $this->TL->log($message, $method, $logLevel, $context);
		$this->assertNull($logged);

		// Enable logging, which is disabled by default.
		trustedlogin_connector()->getSettings()->reset(true);
	}

	/**
	 * @covers \TrustedLogin\Vendor\Plugin::deleteLog
	 * @since 1.1
	 */
	public function test_deleteLog()
	{

		$logFileName = $this->TL->getLogFileName();

		// Enable logging, which is disabled by default.
		trustedlogin_connector()->getSettings()->setGlobalSettings(['error_logging' => true ]);

		$logged = $this->TL->log('Random message', 'method', 'info', [ 'test_context' => [ 'nested' => wp_rand() ] ]);
		$this->assertTrue($logged);
		$this->assertFileExists($logFileName);

		$this->TL->deleteLog();
		$this->assertFileDoesNotExist($logFileName);
	}
}
