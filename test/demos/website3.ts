#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec `dirname $0`/../../node_modules/.bin/ts-node "$0" "$@"

////////////////////////////////////

import { Observable } from '@reactivex/rxjs'

import { auto, Operator, ResolvedStreamDefMap } from '../../src'
import { log_observable } from './rx-log'

////////////////////////////////////


let FETCH_DELAY = 1000
let FETCH_SUCCEED_ON_COUNT = 2
let FRESH_DATA = '[foo] data v1'
let CACHED_DATA: string | null = '[foo] data v1'
let FRESH_PWD = 'pwd v1'
let CACHED_PWD: string | null = '[foo] pwd v1'
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

let fetch_raw_data_count = 0
function fetch_raw_data(vault_id: string) {
	fetch_raw_data_count++
	console.log(`fetch_raw_data called ! #${fetch_raw_data_count}`)

	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('fetch_raw_data resolving...', )
			if (!FETCH_SHOULD_SUCCEED || fetch_raw_data_count < FETCH_SUCCEED_ON_COUNT)
				reject(new Error('404'))
			else
				resolve(FRESH_DATA)
		}, FETCH_DELAY)
	})
}

function retriable_fetch_raw_data(vault_id: string) {
	console.log(`retriable_fetch_raw_data called !`)

	return Observable.create((observer: any) => {
		fetch_raw_data(vault_id)
		.then(val => {
			observer.next(val)
			observer.complete()
		})
		.catch(observer.error)
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
	return {vault_id, raw_data, password}
}
////////////////////////////////////


const subjects = auto({

	////////////////////////////////////
	vault_id, // expose this constant as an observable for composition

	////////////////////////////////////
	cached_raw_data:
		get_cached_raw_data(vault_id),
	fresh_raw_data_once:
		retriable_fetch_raw_data(vault_id),
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
	//logger: console,
	validate: true,
})

for (let id in subjects) {
	log_observable(subjects[id].plain$, id)
}

////////////////////////////////////
