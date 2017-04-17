(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@reactivex/rxjs", "typescript-string-enums"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rx = require("@reactivex/rxjs");
    var typescript_string_enums_1 = require("typescript-string-enums");
    exports.OperatorId = typescript_string_enums_1.Enum('combineLatest', 'concat', 'distinctUntilChanged', 'retry');
    function Operator() {
        var operators_chain = [];
        var i_am_an_rxauto_operator = true;
        function combineLatest(options) {
            if (options === void 0) { options = {}; }
            operators_chain.push({
                id: 'combineLatest',
                project: options.project
            });
            return this;
        }
        function concat() {
            operators_chain.push({
                id: 'concat',
            });
            return this;
        }
        function distinctUntilChanged() {
            operators_chain.push({
                id: 'distinctUntilChanged',
            });
            return this;
        }
        function retry(count) {
            operators_chain.push({
                id: 'retry',
                count: count
            });
            return this;
        }
        function apply() {
            var input$ = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                input$[_i] = arguments[_i];
            }
            if (!operators_chain.length)
                throw new Error('rx-auto: trying to apply an empty operator!');
            if (!input$.length)
                throw new Error('rx-auto: trying to apply an operator to nothing!');
            // only the 1st operator can take multiple observables,
            // let's handle it first
            var obs$;
            var op1 = operators_chain[0]; // shortcut to help typescript compiler
            switch (op1.id) {
                case exports.OperatorId.combineLatest:
                    if (input$.length < 2)
                        throw new Error("rx-auto: combining operator \"combineLatest\" should be given more than 1 observables!");
                    if (op1.project)
                        obs$ = (_a = Rx.Observable).combineLatest.apply(_a, input$.concat([op1.project]));
                    else
                        obs$ = (_b = Rx.Observable).combineLatest.apply(_b, input$);
                    break;
                case exports.OperatorId.concat:
                    if (input$.length < 2)
                        throw new Error("rx-auto: combining operator \"concat\" should be given more than 1 observables!");
                    obs$ = (_c = Rx.Observable).concat.apply(_c, input$);
                    break;
                default:
                    if (input$.length > 1)
                        throw new Error("rx-auto: a non-combining operator was given more than 1 observables!");
                    obs$ = input$[0];
                    break;
            }
            return operators_chain.slice(1).reduce(function (obs$, op) {
                switch (op.id) {
                    case exports.OperatorId.combineLatest:
                    case exports.OperatorId.concat:
                        throw new Error("rx-auto: combining operators (combineLatest, concat\u2026) are only supported in 1st position!");
                    case exports.OperatorId.distinctUntilChanged:
                        return obs$.distinctUntilChanged();
                    case exports.OperatorId.retry:
                        return obs$.retry(op.count);
                    default:
                        throw new Error("rx-auto: unrecognized operator \"" + op.id + "\"!");
                }
            }, obs$);
            var _a, _b, _c;
            /* experiments to sort
             switch (operator) {
    
             case OPERATORS.combineLatestHashDistinctUntilChangedShallow:
             case OPERATORS.combineLatestHash:
    
             observable$ = Rx.Observable.combineLatest(...dependencies$).map(value_array => {
                 const hash:{ [k: string]: any } = {}
                 dependencies.forEach((key, index) => {
                    hash[key] = value_array[index]
                 })
             return hash
             })
    
             if (generator === OPERATORS.combineLatestHashDistinctUntilChangedShallow) {
                 console.error('activating combineLatestHashDistinctUntilChangedShallow')
                 observable$ = observable$.distinctUntilChanged((a, b) => {
                     const x = shallowCompareHash1L(a, b)
                     console.warn('shallow', x)
                     return x
                 })
             }
             break
    
             case OPERATORS.concatDistinctUntilChanged:
             if (dependencies.length < 2) throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`)
             observable$ = Rx.Observable.concat(...dependencies$).distinctUntilChanged()
             break
    
             case OPERATORS.distinct:
             if (dependencies.length > 1) throw new Error(`stream "${id}" filtering operator should have exactly 1 dependency !`)
             observable$ = dependencies$[0].distinct()
             break
    
             case OPERATORS.distinctUntilChanged:
             if (dependencies.length > 1) throw new Error(`stream "${id}" filtering operator should have exactly 1 dependency !`)
             observable$ = dependencies$[0].distinctUntilChanged()
             break
    
             case OPERATORS.merge:
             if (dependencies.length < 2) throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`)
             observable$ = Rx.Observable.merge(...dependencies$)
             break
    
             case OPERATORS.zip:
             if (dependencies.length < 2) throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`)
             observable$ = Rx.Observable.zip(...dependencies$)
             break
             }
             */
        }
        return {
            combineLatest: combineLatest,
            concat: concat,
            distinctUntilChanged: distinctUntilChanged,
            retry: retry,
            apply: apply,
            i_am_an_rxauto_operator: i_am_an_rxauto_operator
        };
    }
    exports.Operator = Operator;
    function isOperator(o) {
        return !!o.i_am_an_rxauto_operator;
    }
    exports.isOperator = isOperator;
});
//# sourceMappingURL=operators.js.map