////////////////////////////////////

import { Observable, Subject } from 'rxjs'

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

	// the generalized stream
	observable?: Observable<any>
	// its corresponding subject
	subject?: Observable<any>
}

interface ResolvedStreamDef extends UnresolvedStreamDef {
	// the generalized stream
	readonly observable: Observable<any>
	// its corresponding subject
	readonly subject: Observable<any>
}

interface UnresolvedStreamDefMap {
	[k: string]: UnresolvedStreamDef
}

interface SubjectsMap {
	[k: string]: Observable<any>
}

////////////////////////////////////

export {
	UnresolvedStreamDef,
	ResolvedStreamDef,
	UnresolvedStreamDefMap,
	SubjectsMap,
}
