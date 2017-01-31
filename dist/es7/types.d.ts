import { Observable } from '@reactivex/rxjs';
interface UnresolvedStreamDef {
    readonly id: string;
    readonly dependencies: string[];
    readonly generator: any;
    observable?: Observable<any>;
    subject?: Observable<any>;
}
interface ResolvedStreamDef extends UnresolvedStreamDef {
    readonly observable: Observable<any>;
    readonly subject: Observable<any>;
}
interface UnresolvedStreamDefMap {
    [k: string]: UnresolvedStreamDef;
}
interface SubjectsMap {
    [k: string]: Observable<any>;
}
export { UnresolvedStreamDef, ResolvedStreamDef, UnresolvedStreamDefMap, SubjectsMap };
