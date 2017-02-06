import { Observable } from '@reactivex/rxjs';
interface UnresolvedStreamDef {
    readonly id: string;
    readonly dependencies: string[];
    readonly generator: any;
    readonly observable$?: Observable<any>;
}
interface ResolvedStreamDef extends UnresolvedStreamDef {
    readonly value?: any;
    readonly promise?: Promise<any>;
    readonly observable$: Observable<any>;
    readonly subject$: Observable<any>;
}
interface UnresolvedStreamDefMap {
    [k: string]: UnresolvedStreamDef;
}
interface ResolvedStreamDefMap {
    [k: string]: ResolvedStreamDef;
}
interface SubjectsMap {
    [k: string]: Observable<any>;
}
export { UnresolvedStreamDef, ResolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDefMap, SubjectsMap };
