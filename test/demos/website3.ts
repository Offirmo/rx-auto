#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec `dirname $0`/../../node_modules/.bin/ts-node "$0" "$@"

////////////////////////////////////

import { Observable } from '@reactivex/rxjs'

import { auto, Operator, ResolvedStreamDefMap } from '../../src'
import { log_observable } from './rx-log'

////////////////////////////////////


let FETCH_DELAY = 1000
let FRESH_DATA = 'fresh foo'
let CACHED_DATA: string | null = 'cached foo'
let FRESH_PWD = 'fresh pwd'
let CACHED_PWD: string | null = 'cached pwd'
let FETCH_SHOULD_SUCCEED = true

let test_case = 1
switch (test_case) {
	case 1:
		// cache available, fetch success
		break

	case 2:
		// no cache yet
		CACHED_DATA = null
		break

	case 3:
		// failure to fetch (promise rejection)
		FETCH_SHOULD_SUCCEED = false
		break

	default:
		throw new Error('please select a test case !')
}


////////////////////////////////////

const vault_id = 'foo'

function fetch_raw_data(vault_id: string) {
	return new Promise((resolve, reject) => {
		console.log('fetch_raw_data called !')
		setTimeout(() => {
			console.log('fetch_raw_data resolving...')
			if (!FETCH_SHOULD_SUCCEED)
				reject(new Error('404'))
			else
				resolve(`[raw data for ${vault_id}]` + FRESH_DATA)
		}, FETCH_DELAY)
	})
}

function get_cached_raw_data(vault_id: string): string | null {
	return CACHED_DATA
}

function get_cached_password(vault_id: string): string | null {
	return CACHED_PWD
}

function get_password$() {
	return Observable.empty()
}

function decrypt_if_needed_then_parse_data(vault_id: string, raw_data: string, password: string = ''): Object {
	return {}
}
////////////////////////////////////


const subjects = auto({

	////////////////////////////////////
	vault_id, // expose this constant as an observable for composition

	////////////////////////////////////
	cached_raw_data:
		get_cached_raw_data(vault_id),
	fresh_raw_data_once:
		fetch_raw_data(vault_id),
	fresh_raw_data: [
		'fresh_raw_data_once',
		Operator().retry(3)
	],
	raw_data: [
		'cached_raw_data',
		'fresh_raw_data',
		Operator()
			.concat()
			.distinctUntilChanged()
	],

	////////////////////////////////////
	cached_password:
		get_cached_password(vault_id),
	fresh_password:
		get_password$,
	password: [
		'cached_password',
		'fresh_password',
		Operator()
			.concat()
			.distinctUntilChanged()
	],

	////////////////////////////////////
	data: [
		'vault_id',
		'raw_data',
		'password',
		Operator().combineLatest({
			project: decrypt_if_needed_then_parse_data
		})
	],
}, {
	logger: console,
	validate: true,
})

for (let id in subjects) {
	log_observable(subjects[id].plain$, id)
}

////////////////////////////////////
