#!/usr/bin/env zx
/**
 * The script inserts or updates a build file link in the first comment of pull requests that include a specific commit.
 *
 * Usage: script <repo> <commit-hash> <build-link> <build-link-text>
 */

import path from 'path';

const [ repo, commitHash, buildLink, buildLinkText ] = process.argv.slice( 3 );

const scriptName = path.basename( process.argv[ 2 ] );

if ( !repo || !commitHash || !buildLink ) {
	console.log( `Usage: ${ scriptName } <repo> <commit-hash> <build-link> <build-link-text>` );

	process.exit( 1 );
}

const linkText = buildLinkText || 'Build file';
const buildLinkRegex = `💾 \\[${ linkText }\\]\\((https?:\\/\\/[^\)]+)\\) \\(\\w+\\)`;
const newBuildLink = `💾 [${ linkText }](${ buildLink }) (${ commitHash })`;
let prs;

console.log( `Fetching PRs that contain commit ${ commitHash } in https://github.com/${ repo }…` );

try {
	const output = ( await quiet( $`gh api repos/${ repo }/commits/${ commitHash }/pulls --jq '.[].number'` ) ).stdout.trim();

	prs = JSON.parse( `[${ output.split( '\n' ).join( ',' ) }]` );
} catch ( e ) {
	console.log( `Error fetching or parsing PRs: ${ e.message }` );

	process.exit();
}

if ( !prs.length ) {
	console.log( `No PRs found for commit ${ commitHash }.` );

	process.exit();
}

for ( const pr of prs ) {
	console.log( `Fetching details for PR #${ pr }…` );

	let prComment;
	let prLatestCommit;

	try {
		prComment = ( await quiet( $`gh pr view ${ pr } --repo ${ repo } --json body -q .body` ) ).stdout.trim();

		prLatestCommit = ( await quiet( $`gh pr view ${ pr } --repo ${ repo } --json headRefOid -q .headRefOid` ) ).stdout.trim();
	} catch ( e ) {
		console.log( `Error fetching PR details: ${ e.message }` );

		continue;
	}

	if ( !prLatestCommit.startsWith( commitHash ) ) {
		console.log( `Skipping PR #${ pr } as it does not contain the latest commit.` );

		continue;
	}

	const buildLink = new RegExp( buildLinkRegex ).test( prComment );
	let updatedPrComment;

	console.log( `Updating PR #${ pr } with new build link…` );

	updatedPrComment = buildLink ? prComment.replace( new RegExp( buildLinkRegex, 'g' ), newBuildLink ) : `${ prComment }\n\n${ newBuildLink }`;

	try {
		await quiet( $`gh pr edit ${ pr } --repo ${ repo } --body ${ updatedPrComment }` );
	} catch ( e ) {
		console.log( `Failed to update PR #${ pr }: ${ e.message }` );
	}
}
