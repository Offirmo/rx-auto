import { UnresolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDef, ResolvedStreamDefMap, SubjectFlavors, SubjectsMap } from './types';
declare const OPERATORS: {
    combineLatest: symbol;
    concat: symbol;
    merge: symbol;
    zip: symbol;
};
interface Injected {
    debug_id: string;
    logger: Console;
}
declare function auto(stream_definitions: {
    [k: string]: any;
}, options?: Partial<Injected>): SubjectsMap;
export { UnresolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDef, ResolvedStreamDefMap, SubjectFlavors, SubjectsMap, OPERATORS, Injected, auto };
