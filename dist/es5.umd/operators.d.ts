import * as Rx from '@reactivex/rxjs';
import { Enum } from "typescript-string-enums";
export declare const OperatorId: {
    combineLatest: "combineLatest";
    concat: "concat";
    distinctUntilChanged: "distinctUntilChanged";
    retry: "retry";
};
export declare type OperatorId = Enum<typeof OperatorId>;
interface Operator<O> {
    combineLatest: (options: any) => Operator<O>;
    concat: () => Operator<O>;
    distinctUntilChanged: () => Operator<O>;
    retry: (count: number) => Operator<O>;
    apply: (...input: Rx.Observable<any>[]) => Rx.Observable<O>;
    i_am_an_rxauto_operator: true;
}
declare function Operator<O extends any>(): Operator<O>;
declare function isOperator(o: Operator<any>): boolean;
export { Operator, isOperator };
