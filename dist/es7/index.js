////////////////////////////////////
import * as tslib_1 from "tslib";
import * as Rx from '@reactivex/rxjs';
import * as _ from 'lodash';
const OPERATORS = {
    combineLatest: Symbol('combineLatest'),
    concat: Symbol('concat'),
    merge: Symbol('merge'),
    zip: Symbol('zip'),
};
////////////////////////////////////
function uniformize_stream_definition(raw_definition, id) {
    if (!_.isString(id) && !_.isSymbol(id))
        throw new Error(`stream ids must be strings or symbols ! ("${typeof id}")`);
    let stream_def = undefined;
    if (_.isArray(raw_definition)) {
        // async style format, convert it
        stream_def = {
            id,
            dependencies: raw_definition.slice(0, -1),
            generator: raw_definition.slice(-1)[0]
        };
    }
    else if (_.isObject(raw_definition)) {
        // is it a stream definition ?
        if (raw_definition.id && _.isString(raw_definition.id) && raw_definition.dependencies && raw_definition.generator) {
            // yes
            stream_def = raw_definition;
        }
    }
    // fallback
    if (!stream_def) {
        // trivial async style format, convert it
        stream_def = {
            id,
            dependencies: [],
            generator: raw_definition
        };
    }
    if (!stream_def.generator)
        throw new Error(`stream definition "${id}" should have a generator !`);
    stream_def.dependencies.forEach(dependency => {
        if (!_.isString(dependency) && !_.isSymbol(dependency))
            throw new Error(`dependencies must be stream ids, which must be strings or symbols ! ("${typeof dependency}")`);
    });
    return stream_def;
}
function subjects_for(observable$, initial_behavior_value) {
    const plain$ = observable$.multicast(new Rx.Subject()).refCount();
    return {
        plain$,
        behavior$: plain$.multicast(new Rx.BehaviorSubject(initial_behavior_value)).refCount(),
        async$: plain$.multicast(new Rx.AsyncSubject()).refCount(),
    };
}
function resolve_stream_from_static_value(stream_def) {
    const observable$ = Rx.Observable.of(stream_def.generator);
    return tslib_1.__assign({}, stream_def, { value: stream_def.generator, promise: Promise.resolve(stream_def.generator), observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
}
function resolve_stream_from_promise(stream_def) {
    const observable$ = Rx.Observable.fromPromise(stream_def.generator);
    return tslib_1.__assign({}, stream_def, { promise: stream_def.generator, observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
}
function resolve_stream_from_observable(stream_def) {
    const observable$ = stream_def.generator;
    return tslib_1.__assign({}, stream_def, { observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
}
function resolve_stream_from_operator(stream_defs_by_id, stream_def) {
    const { id, dependencies, generator } = stream_def;
    if (!dependencies.length)
        throw new Error(`stream "${id}" operator should have dependencies !`);
    let observable$;
    const dependencies$ = stream_def.dependencies
        .map(id => stream_defs_by_id[id])
        .map(resolvedStreamDef => resolvedStreamDef.observable$);
    console.log(`Applying an operator...`, generator, stream_def.dependencies, dependencies$);
    switch (generator) {
        case OPERATORS.combineLatest:
            observable$ = Rx.Observable.combineLatest(...dependencies$);
            break;
        case OPERATORS.concat:
            observable$ = Rx.Observable.concat(...dependencies$);
            break;
        case OPERATORS.merge:
            observable$ = Rx.Observable.merge(...dependencies$);
            break;
        case OPERATORS.zip:
            observable$ = Rx.Observable.zip(...dependencies$);
            break;
        default:
            throw new Error(`stream ${id}: unrecognized or not implemented operator ! ${generator.toString()}`);
    }
    return tslib_1.__assign({}, stream_def, { observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
}
function resolve_stream_observable(stream_defs_by_id, stream_def) {
    const { id } = stream_def;
    let { generator } = stream_def;
    const generated = _.isFunction(generator);
    console.log(`resolving stream "${id}"...`, { generated, generator });
    if (_.isFunction(generator)) {
        // allow custom constructs. We pass full dependencies results
        const stream_deps_by_id = {};
        stream_def.dependencies.forEach(id => {
            stream_deps_by_id[id] = stream_defs_by_id[id];
        });
        // one call is allowed
        generator = generator(stream_deps_by_id);
        console.log(`from "${stream_def.id}" generator function: "${generator}"`);
    }
    if (!generator) {
        console.warn(`Warning: stream definition "${id}" generator function returned "${generator}". This will be considered a final static value.`);
    }
    if (generator && generator.then) {
        // it's a promise !
        if (!generated && stream_def.dependencies.length)
            throw new Error(`stream "${stream_def.id}" is a direct promise but has dependencies !`);
        return resolve_stream_from_promise(tslib_1.__assign({}, stream_def, { generator }));
    }
    if (generator && generator.subscribe) {
        // it's an observable !
        if (!generated && stream_def.dependencies.length)
            throw new Error(`stream "${stream_def.id}" is a direct observable but has dependencies !`);
        return resolve_stream_from_observable(tslib_1.__assign({}, stream_def, { generator }));
    }
    if (_.isSymbol(generator)) {
        switch (generator) {
            case OPERATORS.combineLatest:
            case OPERATORS.concat:
            case OPERATORS.merge:
            case OPERATORS.zip:
                return resolve_stream_from_operator(stream_defs_by_id, tslib_1.__assign({}, stream_def, { generator }));
            default:
                // not ours, consider it a direct sync value
                break;
        }
    }
    if (!generated && stream_def.dependencies.length)
        throw new Error(`stream "${stream_def.id}" is a direct value but has dependencies !`);
    return resolve_stream_from_static_value(tslib_1.__assign({}, stream_def, { generator }));
}
function resolve_streams(stream_defs_by_id, unresolved_stream_defs) {
    const still_unresolved_stream_defs = [];
    unresolved_stream_defs.forEach(stream_def => {
        const has_unresolved_deps = stream_def.dependencies.some(stream_id => !stream_defs_by_id[stream_id].observable$);
        if (!has_unresolved_deps) {
            stream_defs_by_id[stream_def.id] = resolve_stream_observable(stream_defs_by_id, stream_def);
        }
        else {
            still_unresolved_stream_defs.push(stream_def);
        }
    });
    return still_unresolved_stream_defs;
}
function auto(stream_definitions) {
    const stream_defs_by_id = {};
    const stream_defs = [];
    // check and uniformize definitions...
    const stream_ids = Object.keys(stream_definitions);
    stream_ids.forEach(stream_id => {
        // uniformize definitions format
        const standardized_definition = uniformize_stream_definition(stream_definitions[stream_id], stream_id);
        stream_defs_by_id[stream_id] = standardized_definition;
        stream_defs.push(standardized_definition);
    });
    // do some global checks
    stream_ids.forEach(stream_id => {
        const dependencies = stream_defs_by_id[stream_id].dependencies;
        dependencies.forEach(dependency => {
            if (!stream_ids.includes(dependency))
                throw new Error(`Stream definition for "${stream_id}" references an unknown dependency "${dependency}" !`);
        });
    });
    // resolve related streams
    let progress = true;
    let iteration_count = 0;
    const SAFETY_LIMIT = 25;
    let unresolved_stream_defs = stream_defs.slice();
    while (unresolved_stream_defs.length && progress && iteration_count < SAFETY_LIMIT) {
        iteration_count++;
        const still_unresolved_stream_defs = resolve_streams(stream_defs_by_id, unresolved_stream_defs);
        progress = still_unresolved_stream_defs.length < unresolved_stream_defs.length;
        unresolved_stream_defs = still_unresolved_stream_defs;
    }
    if (unresolved_stream_defs.length)
        throw new Error('deadlock resolving streams, please check dependencies !');
    const subjects = {};
    stream_ids.forEach(stream_id => {
        subjects[stream_id] = stream_defs_by_id[stream_id].subjects;
    });
    return subjects;
}
////////////////////////////////////
export { OPERATORS, auto, };
//# sourceMappingURL=index.js.map