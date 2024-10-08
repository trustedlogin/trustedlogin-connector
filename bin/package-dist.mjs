#!/usr/bin/env zx
/**
 * The script creates a distribution ZIP archive for the plugin.
 *
 * Usage: script <commit-hash>
 */

import path from 'path';

const tempDir = 'dist_archive_temp';

const distArchive = 'trustedlogin-connector{version}{hash}.zip';

const distArchiveContents = [
	'trustedlogin-connector.php',
	'readme.txt',
	'composer.json',
	'php',
	'vendor',
	'build',
	'wpbuild',
	'src/trustedlogin-settings/init.php',
	'src/trustedlogin-dist.css'
];

const pluginFile = 'trustedlogin-connector.php';
const pluginPrefix = 'trustedlogin-connector';
const pluginVersion = await getPluginVersion();

const [ commitHash ] = process.argv.slice( 3 );

async function getPluginVersion() {
	let version;

	try {
		const fileContent = await fs.readFile( pluginFile, 'utf8' );

		version = fileContent.match( /Version:\s*(\S+)/ );
		version = version ? version[ 1 ] : null;
	} catch ( error ) {
		console.error( `Error reading version from plugin file: ${ error }` );

		process.exit( 1 );
	}

	if ( !version ) {
		console.error( 'Could not find version in plugin file.' );

		process.exit( 1 );
	}

	return version;
}

async function createDistArchive() {
	const _tempDir = `${ tempDir }/${ pluginPrefix }`;
	const finalDistArchive = distArchive
		.replace( '{version}', `-${ pluginVersion }` )
		.replace( '{hash}', commitHash ? `-${ commitHash }` : '' );

	try {
		console.log( `Creating distribution archive for version ${ pluginVersion }…` );

		// Create directories for files that are in subdirectories (e.g., 'src/trustedlogin-settings/init.php').
		const directories = new Set( distArchiveContents
			.map( path => path.includes( '/' ) ? path.substring( 0, path.lastIndexOf( '/' ) ) : '' )
			.filter( path => path.length > 0 ) ); // Exclude any empty paths.

		for ( const dir of directories ) {
			await $`mkdir -p ${ _tempDir }/${ dir }`;
		}

		await Promise.all( distArchiveContents.map( path => $`cp -R ${ path } ${ _tempDir }/${ path }` ) );

		cd( tempDir );

		await $`zip -r ../${ finalDistArchive } ${ pluginPrefix }`;

		cd( '..' );

		await $`rm -rf ${ tempDir }`;
	} catch ( error ) {
		console.error( `Could not create distribution archive: ${ error }` );

		process.exit( 1 );
	}

	if ( process.env.GITHUB_ENV ) {
		await $`echo "DIST_ARCHIVE=${ finalDistArchive }" >> $GITHUB_ENV`;
	} else {
		echo `Distribution archive created: ${ finalDistArchive }`;
	}
}

createDistArchive();
