////////////////////////////////////

import { Observable } from '@reactivex/rxjs'

////////////////////////////////////

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html
/*type Partial<T> = {
	[P in keyof T]?: T[P]
}*/

////////////////////////////////////

interface UnresolvedStreamDef {
	readonly id: string
	readonly dependencies: string[]

	// intermediate data
	readonly generator: any

	// the generalized stream (its presence hints the stream is resolved and can be upcasted)
	readonly observable$?: Observable<any>
}

interface ResolvedStreamDef extends UnresolvedStreamDef {
	// the source static value (if any)
	readonly value?: any
	// the source promise (if any)
	readonly promise?: Promise<any>
	// the generalized stream
	readonly observable$: Observable<any>
	// its corresponding subject
	readonly subject$: Observable<any>
}

interface UnresolvedStreamDefMap {
	[k: string]: UnresolvedStreamDef
}

interface ResolvedStreamDefMap {
	[k: string]: ResolvedStreamDef
}

interface SubjectsMap {
	[k: string]: Observable<any>
}

////////////////////////////////////

export {
	UnresolvedStreamDef,
	ResolvedStreamDef,
	UnresolvedStreamDefMap,
	ResolvedStreamDefMap,
	SubjectsMap,
}
