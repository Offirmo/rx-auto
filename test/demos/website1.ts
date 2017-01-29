#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec `dirname $0`/../../node_modules/.bin/ts-node "$0" "$@"

////////////////////////////////////

import { Observable } from 'rxjs'

import { auto, OPERATORS } from '../../src'

////////////////////////////////////

// beware, will instantiate the observable
const start = Date.now()
const pad = '000000'
const pad_size = 6
function log_observable(observable: Observable<any>, id: string) {
	return observable.subscribe(
		x =>     console.log(`T=${(pad + (Date.now() - start)).slice(-pad_size)} [${id}] ..."${x.toString()}"`),
		err => console.error(`T=${(pad + (Date.now() - start)).slice(-pad_size)} [${id}] ...Error: "${err}" !`),
		() =>    console.log(`T=${(pad + (Date.now() - start)).slice(-pad_size)} [${id}] ...Completed.`)
	)
}
////////////////////////////////////


let FETCH_DELAY = 1000
let FRESH_DATA = 'fresh foo'
let CACHED_DATA: string | null = null

let test_case = 1
switch (test_case) {
	case 1:
		// cache available
		CACHED_DATA = 'cached foo'
		break

	case 2:
		// no cache yet
		break

	default:
		throw new Error('please select a test case !')
}

function fetch_data() {
	return new Promise(resolve => {
		console.log('observable rxo_fresh_content promise created !')
		setTimeout(() => {
			console.log('observable rxo_fresh_content : resolving (and completing)')
			resolve(FRESH_DATA)
		}, FETCH_DELAY)
	})
}

////////////////////////////////////

const subjects = auto({
	vault_id:    function get_vault_id() { return 'default'},
	cached_data: function get_cached_data() { return CACHED_DATA },
	fresh_data:  fetch_data,
	data:        [ 'cached_data', 'fresh_data', OPERATORS.merge ]
})

for (let id in subjects) {
	log_observable(subjects[id], id)
}

////////////////////////////////////

// actions
const sbs1 = subjects['fresh_data'].subscribe(x => {
	// pretend we did it...
	console.info('updated cache with fresh data:', x)
	sbs1.unsubscribe();
})

// race ?
// test every cases: cache, no cache

setTimeout(() => console.log('artificial wait done'), 2000)

/*
 var subject = new Rx.BehaviorSubject(0); // 0 is the initial value

 subject.subscribe({
 next: (v) => console.log('observerA: ' + v)
 });

 subject.next(1);
 subject.next(2);

 subject.subscribe({
 next: (v) => console.log('observerB: ' + v)
 });

 subject.next(3);
 */

