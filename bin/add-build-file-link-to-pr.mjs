#!/usr/bin/env zx
/**
 * The script inserts or updates a build file link in the first comment of all pull requests that include a specific commit as the latest commit.
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
const buildLinkRegex = new RegExp( `💾 \\[${linkText}\\]\\(([^)]+)\\) \\(([^)]+)\\)\.`, 'g' );
const newBuildLink = `💾 [${ linkText }](${ buildLink }) (${ commitHash }).`;

console.log( `Fetching all open PRs in https://github.com/${ repo }…` );

try {
	const output = ( await quiet( $`gh pr list --repo ${ repo } --state open --json number` ) ).stdout.trim();
	const prs = JSON.parse( output );

	for ( const { number: pr } of prs ) {
		console.log( `Checking PR #${ pr } for commit ${ commitHash }…` );

		const prDetails = ( await quiet( $`gh pr view ${ pr } --repo ${ repo } --json body,commits` ) ).stdout.trim();
		const { body: prBody, commits: prCommits } = JSON.parse( prDetails );
		const commits = prCommits.map( commit => commit.oid );
		const latestCommit = commits[ commits.length - 1 ];

		if ( !latestCommit.startsWith( commitHash ) ) {
			console.log( `Skipping PR #${ pr } as it does not contain the latest commit.` );

			continue;
		}

		console.log( `Updating PR #${ pr } with a build link…` );

		const updatedPrBody = buildLinkRegex.test( prBody ) ? prBody.replace( buildLinkRegex, newBuildLink ) : `${ prBody }\n\n${ newBuildLink }`;

		try {
			await quiet( $`gh pr edit ${ pr } --repo ${ repo } --body ${ updatedPrBody }` );
		} catch ( e ) {
			console.log( `Failed to update PR #${ pr }: ${ e.message }` );
		}

	}
} catch ( error ) {
	console.error( `Error fetching PRs: ${ error.message }` );

	process.exit();
}
