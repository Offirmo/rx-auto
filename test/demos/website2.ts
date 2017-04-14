#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec `dirname $0`/../../node_modules/.bin/ts-node "$0" "$@"

////////////////////////////////////

import { Observable } from '@reactivex/rxjs'

import { auto, OPERATORS, ResolvedStreamDefMap } from '../../src'

////////////////////////////////////

// beware, will instantiate the observable
const start = Date.now()
const pad = '000000'
const pad_size = 6
function log_observable(observable: Observable<any>, id: string) {
	return observable.subscribe(
		x   =>   console.log(`T=${(pad + (Date.now() - start)).slice(-pad_size)} [${id}] ..."${x}"`),
		err => console.error(`T=${(pad + (Date.now() - start)).slice(-pad_size)} [${id}] ...[Error: "${err}" !]`),
		()  =>   console.log(`T=${(pad + (Date.now() - start)).slice(-pad_size)} [${id}] ...[Completed]`)
	)
}

////////////////////////////////////


let FETCH_DELAY = 1000
let FRESH_DATA = 'fresh foo'
let CACHED_DATA: string | null = 'cached foo'
let FETCH_SHOULD_SUCCEED = true

let test_case = 3
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

function get_vault_id() {
	return 'default'
}

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

function fetch_data() {
	return new Promise(resolve => {
		console.log('observable "rxo_fresh_content" promise created !')
		setTimeout(() => {
			console.log('observable rxo_fresh_content : resolving (and completing)')
			resolve(FRESH_DATA)
		}, FETCH_DELAY)
	})
}

////////////////////////////////////

const subjects = auto({
	vault_id:    get_vault_id,
	cached_data: [ 'vault_id', (deps: ResolvedStreamDefMap) => get_cached_raw_data(deps['vault_id'].value)],
	fresh_data:  [ 'vault_id', (deps: ResolvedStreamDefMap) => fetch_raw_data(deps['vault_id'].value)],
	data:        [ 'cached_data', 'fresh_data', OPERATORS.merge ]
})

for (let id in subjects) {
	log_observable(subjects[id].plain$, id)
}

////////////////////////////////////

// actions
const sbs1 = subjects['fresh_data'].plain$.subscribe(x => {
	// pretend we did it...
	console.info('updated cache with fresh data:', x)
	sbs1.unsubscribe();
})

setTimeout(() => console.log('artificial wait done'), 2000)
