////////////////////////////////////
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@reactivex/rxjs", "lodash"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Rx = require("@reactivex/rxjs");
    var _ = require("lodash");
    ////////////////////////////////////
    var OPERATORS = {
        combineLatest: Symbol('combineLatest'),
        concat: Symbol('concat'),
        merge: Symbol('merge'),
        zip: Symbol('zip'),
    };
    exports.OPERATORS = OPERATORS;
    var invocation_count = 0;
    ////////////////////////////////////
    function uniformize_stream_definition(raw_definition, id) {
        if (!_.isString(id) && !_.isSymbol(id))
            throw new Error("stream ids must be strings or symbols ! (\"" + typeof id + "\")");
        var stream_def = undefined;
        if (_.isArray(raw_definition)) {
            // async style format, convert it
            stream_def = {
                id: id,
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
                id: id,
                dependencies: [],
                generator: raw_definition
            };
        }
        if (!stream_def.generator)
            throw new Error("stream definition \"" + id + "\" should have a generator !");
        stream_def.dependencies.forEach(function (dependency) {
            if (!_.isString(dependency) && !_.isSymbol(dependency))
                throw new Error("dependencies must be stream ids, which must be strings or symbols ! (\"" + typeof dependency + "\")");
        });
        return stream_def;
    }
    function subjects_for(observable$, initial_behavior_value) {
        var plain$ = observable$.multicast(new Rx.Subject()).refCount();
        return {
            plain$: plain$,
            behavior$: plain$.multicast(new Rx.BehaviorSubject(initial_behavior_value)).refCount(),
            async$: plain$.multicast(new Rx.AsyncSubject()).refCount(),
        };
    }
    function resolve_stream_from_static_value(stream_def) {
        var observable$ = Rx.Observable.of(stream_def.generator);
        return tslib_1.__assign({}, stream_def, { value: stream_def.generator, promise: Promise.resolve(stream_def.generator), observable$: observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_from_promise(stream_def) {
        var observable$ = Rx.Observable.fromPromise(stream_def.generator);
        return tslib_1.__assign({}, stream_def, { promise: stream_def.generator, observable$: observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_from_observable(stream_def) {
        var observable$ = stream_def.generator;
        return tslib_1.__assign({}, stream_def, { observable$: observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_from_operator(injected, stream_defs_by_id, stream_def) {
        var id = stream_def.id, dependencies = stream_def.dependencies, generator = stream_def.generator;
        if (!dependencies.length)
            throw new Error("stream \"" + id + "\" operator should have dependencies !");
        var observable$;
        var dependencies$ = stream_def.dependencies
            .map(function (id) { return stream_defs_by_id[id]; })
            .map(function (resolvedStreamDef) { return resolvedStreamDef.observable$; });
        injected.logger.log("Applying an operator...", generator, stream_def.dependencies, dependencies$);
        switch (generator) {
            case OPERATORS.combineLatest:
                observable$ = (_a = Rx.Observable).combineLatest.apply(_a, dependencies$);
                break;
            case OPERATORS.concat:
                observable$ = (_b = Rx.Observable).concat.apply(_b, dependencies$);
                break;
            case OPERATORS.merge:
                observable$ = (_c = Rx.Observable).merge.apply(_c, dependencies$);
                break;
            case OPERATORS.zip:
                observable$ = (_d = Rx.Observable).zip.apply(_d, dependencies$);
                break;
            default:
                throw new Error("stream " + id + ": unrecognized or not implemented operator ! " + generator.toString());
        }
        return tslib_1.__assign({}, stream_def, { observable$: observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
        var _a, _b, _c, _d;
    }
    function resolve_stream_observable(injected, stream_defs_by_id, stream_def) {
        var id = stream_def.id;
        var generator = stream_def.generator;
        var generated = _.isFunction(generator);
        injected.logger.log("resolving stream \"" + id + "\"...", { generated: generated, generator: generator });
        if (_.isFunction(generator)) {
            // allow custom constructs. We pass full dependencies results
            var stream_deps_by_id_1 = {};
            stream_def.dependencies.forEach(function (id) {
                stream_deps_by_id_1[id] = stream_defs_by_id[id];
            });
            // one call is allowed
            generator = generator(stream_deps_by_id_1);
            injected.logger.log("from \"" + stream_def.id + "\" generator function: \"" + generator + "\"");
        }
        if (!generator) {
            injected.logger.warn("Warning: stream definition \"" + id + "\" generator function returned \"" + generator + "\". This will be considered a final static value.");
        }
        if (generator && generator.then) {
            // it's a promise !
            if (!generated && stream_def.dependencies.length)
                throw new Error("stream \"" + stream_def.id + "\" is a direct promise but has dependencies !");
            return resolve_stream_from_promise(tslib_1.__assign({}, stream_def, { generator: generator }));
        }
        if (generator && generator.subscribe) {
            // it's an observable !
            if (!generated && stream_def.dependencies.length)
                throw new Error("stream \"" + stream_def.id + "\" is a direct observable but has dependencies !");
            return resolve_stream_from_observable(tslib_1.__assign({}, stream_def, { generator: generator }));
        }
        if (_.isSymbol(generator)) {
            switch (generator) {
                case OPERATORS.combineLatest:
                case OPERATORS.concat:
                case OPERATORS.merge:
                case OPERATORS.zip:
                    return resolve_stream_from_operator(injected, stream_defs_by_id, tslib_1.__assign({}, stream_def, { generator: generator }));
                default:
                    // not ours, consider it a direct sync value
                    break;
            }
        }
        if (!generated && stream_def.dependencies.length)
            throw new Error("stream \"" + stream_def.id + "\" is a direct value but has dependencies !");
        return resolve_stream_from_static_value(tslib_1.__assign({}, stream_def, { generator: generator }));
    }
    function resolve_streams(injected, stream_defs_by_id, unresolved_stream_defs) {
        var still_unresolved_stream_defs = [];
        unresolved_stream_defs.forEach(function (stream_def) {
            var has_unresolved_deps = stream_def.dependencies.some(function (stream_id) { return !stream_defs_by_id[stream_id].observable$; });
            if (!has_unresolved_deps) {
                injected.logger.groupCollapsed("resolving stream \"" + stream_def.id + "\"\u2026");
                stream_defs_by_id[stream_def.id] = resolve_stream_observable(injected, stream_defs_by_id, stream_def);
                injected.logger.groupEnd();
            }
            else {
                still_unresolved_stream_defs.push(stream_def);
            }
        });
        return still_unresolved_stream_defs;
    }
    function auto(stream_definitions, options) {
        if (options === void 0) { options = {}; }
        invocation_count++;
        var injected = {
            debug_id: options.debug_id || "rx-auto invocation #" + invocation_count + "\u2026",
            logger: options.logger || {
                groupCollapsed: function () { return undefined; },
                groupEnd: function () { return undefined; },
                log: function () { return undefined; },
                info: function () { return undefined; },
                warn: function () { return undefined; },
                error: function () { return undefined; },
            },
        };
        injected.logger.groupCollapsed(injected.debug_id);
        injected.logger.log('Starting… params=', { stream_definitions: stream_definitions, options: options });
        var stream_defs_by_id = {};
        var stream_defs = [];
        // check and uniformize definitions...
        var stream_ids = Object.keys(stream_definitions);
        stream_ids.forEach(function (stream_id) {
            // uniformize definitions format
            var standardized_definition = uniformize_stream_definition(stream_definitions[stream_id], stream_id);
            stream_defs_by_id[stream_id] = standardized_definition;
            stream_defs.push(standardized_definition);
        });
        injected.logger.info("Found " + stream_defs.length + " stream definitions:", Object.keys(stream_defs_by_id));
        // do some global checks
        injected.logger.log('Starting a global check…');
        stream_ids.forEach(function (stream_id) {
            var dependencies = stream_defs_by_id[stream_id].dependencies;
            dependencies.forEach(function (dependency) {
                if (!stream_ids.includes(dependency))
                    throw new Error("Stream definition for \"" + stream_id + "\" references an unknown dependency \"" + dependency + "\" !");
            });
        });
        injected.logger.log("Check OK. State so far =", stream_defs_by_id);
        // resolve related streams
        var progress = true;
        var iteration_count = 0;
        var SAFETY_LIMIT = 25;
        var unresolved_stream_defs = stream_defs.slice();
        injected.logger.groupCollapsed('Streams resolution…');
        while (unresolved_stream_defs.length && progress && iteration_count < SAFETY_LIMIT) {
            iteration_count++;
            var still_unresolved_stream_defs = resolve_streams(injected, stream_defs_by_id, unresolved_stream_defs);
            progress = still_unresolved_stream_defs.length < unresolved_stream_defs.length;
            unresolved_stream_defs = still_unresolved_stream_defs;
        }
        if (unresolved_stream_defs.length)
            throw new Error('deadlock resolving streams, please check dependencies !');
        injected.logger.groupEnd();
        var subjects = {};
        stream_ids.forEach(function (stream_id) {
            subjects[stream_id] = stream_defs_by_id[stream_id].subjects;
        });
        injected.logger.groupEnd();
        return subjects;
    }
    exports.auto = auto;
});
//# sourceMappingURL=index.js.map