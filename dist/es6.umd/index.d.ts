import { SubjectsMap } from './types';
declare const OPERATORS: {
    concat: symbol;
    merge: symbol;
    zip: symbol;
};
declare function auto(stream_definitions: {
    [k: string]: any;
}): SubjectsMap;
export { OPERATORS, auto };
