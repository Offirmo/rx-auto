////////////////////////////////////
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@reactivex/rxjs", "lodash", "./operators"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Rx = require("@reactivex/rxjs");
    var _ = require("lodash");
    var operators_1 = require("./operators");
    exports.Operator = operators_1.Operator;
    ////////////////////////////////////
    // to auto-name rx-auto invocations, for debug
    var invocation_count = 0;
    var default_dependencies = {
        SAFETY_LIMIT: 25,
        debug_id: '???',
        logger: {
            groupCollapsed: function () { return undefined; },
            groupEnd: function () { return undefined; },
            log: function () { return undefined; },
            info: function () { return undefined; },
            warn: function () { return undefined; },
            error: function () { return undefined; },
        },
        validate: true,
    };
    ////////////////////////////////////
    function is_correct_stream_id(id) {
        return _.isString(id) || _.isSymbol(id);
    }
    function uniformize_stream_definition(raw_definition, id) {
        if (!is_correct_stream_id(id))
            throw new Error("stream ids must be strings or symbols ! (\"" + typeof id + "\")");
        var stream_def;
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
        stream_def.dependencies.forEach(function (dependency_id) {
            if (!is_correct_stream_id(dependency_id))
                throw new Error("dependencies must be stream ids, which must be strings or symbols ! (\"" + typeof dependency_id + "\")");
        });
        return stream_def;
    }
    function subjects_for(observable$, initial_behavior_value) {
        var plain$ = observable$.multicast(new Rx.Subject()).refCount();
        return {
            plain$: plain$,
            behavior$: observable$.multicast(new Rx.BehaviorSubject(initial_behavior_value)).refCount(),
            async$: observable$.multicast(new Rx.AsyncSubject()).refCount(),
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
        var id = stream_def.id, dependencies = stream_def.dependencies, operator = stream_def.generator;
        if (!dependencies.length)
            throw new Error("stream \"" + id + "\" operator should have dependencies !");
        var observable$;
        var dependencies$ = stream_def.dependencies
            .map(function (id) { return stream_defs_by_id[id]; })
            .map(function (resolvedStreamDef) { return resolvedStreamDef.observable$; });
        injected.logger.log("Applying operators...", stream_def.dependencies, dependencies$);
        observable$ = operator.apply.apply(operator, dependencies$);
        return tslib_1.__assign({}, stream_def, { observable$: observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_observable(dependencies, stream_defs_by_id, stream_def) {
        var logger = dependencies.logger;
        var id = stream_def.id;
        var generator = stream_def.generator;
        var generated = _.isFunction(generator);
        logger.log("resolving stream \"" + id + "\"...", { generated: generated, generator: generator });
        if (_.isFunction(generator)) {
            // allow custom constructs. We pass full dependencies results
            var stream_deps_by_id_1 = {};
            stream_def.dependencies.forEach(function (id) {
                stream_deps_by_id_1[id] = stream_defs_by_id[id];
            });
            // one call is allowed
            generator = generator(stream_deps_by_id_1);
            logger.log("from \"" + stream_def.id + "\" generator function: \"" + generator + "\"");
        }
        if (!generator) {
            logger.warn("Warning: stream definition \"" + id + "\" generator function returned \"" + generator + "\". This will be considered a final static value.");
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
        if (operators_1.isOperator(generator))
            return resolve_stream_from_operator(dependencies, stream_defs_by_id, tslib_1.__assign({}, stream_def, { generator: generator }));
        if (!generated && stream_def.dependencies.length)
            throw new Error("stream \"" + stream_def.id + "\" is a direct value but has dependencies !");
        return resolve_stream_from_static_value(tslib_1.__assign({}, stream_def, { generator: generator }));
    }
    function resolve_streams(dependencies, stream_defs_by_id, unresolved_stream_defs) {
        var logger = dependencies.logger;
        var still_unresolved_stream_defs = [];
        unresolved_stream_defs.forEach(function (stream_def) {
            var has_unresolved_deps = stream_def.dependencies.some(function (stream_id) { return !stream_defs_by_id[stream_id].observable$; });
            if (!has_unresolved_deps) {
                if (logger.groupCollapsed)
                    logger.groupCollapsed("resolving stream \"" + stream_def.id + "\"\u2026");
                stream_defs_by_id[stream_def.id] = resolve_stream_observable(dependencies, stream_defs_by_id, stream_def);
                if (logger.groupEnd)
                    logger.groupEnd();
            }
            else {
                still_unresolved_stream_defs.push(stream_def);
            }
        });
        return still_unresolved_stream_defs;
    }
    function auto(stream_definitions, partial_dependencies) {
        if (partial_dependencies === void 0) { partial_dependencies = {}; }
        invocation_count++;
        var dependencies = Object.assign({}, default_dependencies, { debug_id: "rx-auto invocation #" + invocation_count + "\u2026" }, partial_dependencies);
        var SAFETY_LIMIT = dependencies.SAFETY_LIMIT, debug_id = dependencies.debug_id, logger = dependencies.logger;
        if (logger.groupCollapsed)
            logger.groupCollapsed(debug_id);
        logger.log('Starting… params=', { stream_definitions: stream_definitions, dependencies: dependencies });
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
        logger.info("Found " + stream_defs.length + " stream definitions:", Object.keys(stream_defs_by_id));
        // do some global checks
        logger.log('Starting a global check…');
        stream_ids.forEach(function (stream_id) {
            var dependencies = stream_defs_by_id[stream_id].dependencies;
            dependencies.forEach(function (dependency) {
                if (!stream_ids.includes(dependency))
                    throw new Error("Stream definition for \"" + stream_id + "\" references an unknown dependency \"" + dependency + "\" !");
            });
        });
        logger.log("Check OK. State so far =", stream_defs_by_id);
        // resolve related streams
        var progress = true;
        var iteration_count = 0;
        var unresolved_stream_defs = stream_defs.slice();
        if (logger.groupCollapsed)
            logger.groupCollapsed('Streams resolution…');
        while (unresolved_stream_defs.length && progress && iteration_count < SAFETY_LIMIT) {
            iteration_count++;
            var still_unresolved_stream_defs = resolve_streams(dependencies, stream_defs_by_id, unresolved_stream_defs);
            progress = still_unresolved_stream_defs.length < unresolved_stream_defs.length;
            unresolved_stream_defs = still_unresolved_stream_defs;
        }
        if (unresolved_stream_defs.length)
            throw new Error('deadlock resolving streams, please check dependencies !');
        if (logger.groupEnd)
            logger.groupEnd();
        var subjects = {};
        stream_ids.forEach(function (stream_id) {
            subjects[stream_id] = stream_defs_by_id[stream_id].subjects;
        });
        if (logger.groupEnd)
            logger.groupEnd();
        return subjects;
    }
    exports.auto = auto;
});
//# sourceMappingURL=index.js.map