# rx-auto
intelligently combines a set of generic streams (Rx.observable, promises, static values)
in "async.auto" style !

IN PROGRESS ! API is being refined on a real project.


## The story
Since attending a great talk on reactive programming at [dotJS Paris 2015](http://2015.dotjs.io/) (oh man time flies…),
I investigated in this kind of architecture.

However, manually instantiating and wiring together a set of related streams
soon proved cumbersome, requiring a lot of boilerplate code.

Remembering the very convenient [async.auto](http://caolan.github.io/async/docs.html#auto) interface to coordinate a set of async tasks,
I set of on an open-source journey to offer this great convenience to a RX-based system.


## Usage

(fluency with [RxJS](http://reactivex.io/rxjs/manual/overview.html) is expected)

### installation

```bash
npm install --save @offirmo/rx-auto
```

This lib is a state-of-the art 2017 module, correctly exposing node, UMD and ES7 flavors in their respective entries in package.json.
Modern tooling should be at ease.

For users doing stuff manually:
* several build flavors are available in `/dist`
* typescript's companion lib `tslib` is needed (not bundled together to avoid redundancy).
  Exact instructions are depending your dependency manager -> you'll see errors if not present

### Usage / Example

TODO nice schema and corresponding code

### Notes

* I tried hard at providing precise, meaningful errors. So experiment: you'll be told what's wrong.
* There is a crude infinite loop detection
* Since Observables are "templates" instantiated on-demand, rx-auto call is **synchronous** !
If this startle you, go back at RxJS doc to better understand Observables.

### Advanced features


## Contributing
PR welcome. see CONTRIBUTING.md


## Licence
The UNLICENSE. Do wathever-you-want.
