import { UnresolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDef, ResolvedStreamDefMap, SubjectFlavors, SubjectsMap } from './types';
declare const OPERATORS: {
    concat: symbol;
    merge: symbol;
    zip: symbol;
};
declare function auto(stream_definitions: {
    [k: string]: any;
}): SubjectsMap;
export { UnresolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDef, ResolvedStreamDefMap, SubjectFlavors, SubjectsMap, OPERATORS, auto };
