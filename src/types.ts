////////////////////////////////////

import { Observable } from '@reactivex/rxjs'

//import { Operator } from './operators'

////////////////////////////////////

type StreamId = string | symbol

interface UnresolvedStreamDef {
	readonly id: StreamId
	readonly dependencies: string[]
	readonly initialValue?: any // for creating the BehaviorSubject

	// intermediate data
	readonly generator: any

	// the generalized stream (its presence hints the stream is resolved and can be upcasted)
	readonly observable$?: Observable<any>
}

export interface SubjectFlavors<T> {
	plain$: Observable<T>
	behavior$: Observable<T>
	async$: Observable<T>
}

interface ResolvedStreamDef extends UnresolvedStreamDef {
	// the source static value (if any)
	readonly value?: any
	// the source promise (if any)
	readonly promise?: Promise<any>
	// the generalized stream
	readonly observable$: Observable<any>
	// its corresponding subjects (all variant created for convenience)
	readonly subjects: SubjectFlavors<any>
}

interface UnresolvedStreamDefMap {
	[k: string]: UnresolvedStreamDef
}

interface ResolvedStreamDefMap {
	[k: string]: ResolvedStreamDef
}

interface SubjectsMap {
	[k: string]: SubjectFlavors<any>
}

////////////////////////////////////

export {
	StreamId,
	UnresolvedStreamDef,
	ResolvedStreamDef,
	UnresolvedStreamDefMap,
	ResolvedStreamDefMap,
	SubjectsMap,
}
