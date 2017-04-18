import { UnresolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDef, ResolvedStreamDefMap, SubjectFlavors, SubjectsMap } from './types';
import { Operator } from './operators';
interface InjectableDependencies {
    SAFETY_LIMIT: number;
    debug_id: string;
    logger: Console;
    validate: boolean;
}
declare function auto(stream_definitions: {
    [k: string]: any;
}, partial_dependencies?: Partial<InjectableDependencies>): SubjectsMap;
export { UnresolvedStreamDef, UnresolvedStreamDefMap, ResolvedStreamDef, ResolvedStreamDefMap, SubjectFlavors, SubjectsMap, Operator, InjectableDependencies, auto };
