import { Observable } from '@reactivex/rxjs';
interface UnresolvedStreamDef {
    readonly id: string;
    readonly dependencies: string[];
    readonly initialValue?: any;
    readonly generator: any;
    readonly observable$?: Observable<any>;
}
export interface SubjectFlavors<T> {
    plain$: Observable<T>;
    behavior$: Observable<T>;
    async$: Observable<T>;
}
interface ResolvedStreamDef extends UnresolvedStreamDef {
    readonly value?: any;
    readonly promise?: Promise<any>;
    readonly observable$: Observable<any>;
    readonly subjects: SubjectFlavors<any>;
}
interface UnresolvedStreamDefMap {
    [k: string]: UnresolvedStreamDef;
}
interface ResolvedStreamDefMap {
    [k: string]: ResolvedStreamDef;
}
interface SubjectsMap {
    [k: string]: SubjectFlavors<any>;
}
export { UnresolvedStreamDef, ResolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDefMap, SubjectsMap };
