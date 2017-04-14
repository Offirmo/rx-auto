import * as Rx from '@reactivex/rxjs'
import { Enum } from "typescript-string-enums"


/*const OPERATORS = {
 combineLatest: Symbol('combineLatest'),
 combineLatestHash: Symbol('combineLatestHash'),
 combineLatestHashDistinctUntilChangedShallow: Symbol('combineLatestHashDistinctUntilChangedShallow'),
 concat: Symbol('concat'),
 concatDistinctUntilChanged: Symbol('concatDistinctUntilChanged'),
 distinct: Symbol('distinct'),
 distinctUntilChanged: Symbol('distinctUntilChanged'),
 merge: Symbol('merge'),
 zip: Symbol('zip'),
 }*/

export const OperatorId = Enum(
	'combineLatest',
	//'combineLatestHash',
	'concat',
	'retry',
	/*'distinct',
	'distinctUntilChanged',
	'distinctUntilChangedShallow',
	'merge',
	'zip',*/
)
export type OperatorId = Enum<typeof OperatorId>

interface BaseOperatorInstance<O> {
	id: string
}

interface CombineLatestOperatorInstance<O> extends BaseOperatorInstance<O> {
	id: 'combineLatest'
	project?: (...values: any[]) => any
}

interface ConcatOperatorInstance<O> extends BaseOperatorInstance<O> {
	id: 'concat'
}

interface distinctUntilChangedOperatorInstance<O> extends BaseOperatorInstance<O> {
	id: 'distinctUntilChanged'
}



type OperatorInstance<O> =
	CombineLatestOperatorInstance<O>
	| ConcatOperatorInstance<O>
	| distinctUntilChangedOperatorInstance<O>


interface Operator<O> {
	//operatorsChain: OperatorInstance<O>[]
	combineLatest: (options: any) => Operator<O>
	concat: () => Operator<O>
	distinctUntilChanged: () => Operator<O>
	retry: (count: number) => Operator<O>
	i_am_an_rxauto_operator: true
}

function Operator<O extends any>(): Operator<O> {
	//const operatorsChain: OperatorInstance<O>[] = []
	const i_am_an_rxauto_operator = true

	function combineLatest(this: Operator<O>, options: any = {}): Operator<O> {
		// XXX
		return this
	}

	function concat(this: Operator<O>): Operator<O> {
		// XXX
		return this
	}

	function distinctUntilChanged(this: Operator<O>): Operator<O> {
		// XXX
		return this
	}

	function retry(this: Operator<O>, count: number): Operator<O> {
		// XXX
		return this
	}

	return {
		combineLatest,
		concat,
		distinctUntilChanged,
		retry,

		//operatorsChain,
		i_am_an_rxauto_operator
	}
}

function isOperator(o: Operator<any>) {
	return !!o.i_am_an_rxauto_operator
}

export {
	Operator,
	isOperator,
}
