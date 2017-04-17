
TODO
- more operators
- tests
- doc

v0.1.0
------
- rewrote logs:
  - no output by default
  - if enabled, cleanly output using groupcollapsed()
- build script is now watchable (good for dev / npm link)
- refactored the operator feature to allow any kind of composition

v0.0.6
------
- relaxed some readonly restrictions on the external API (don't coerce the final user)
- added checks: dependency ids are correctly typed and references actual streams
- relax "is direct observable bt has dependencies"

v0.0.5
------
- null & undefined now allowed as static values
- improved log traces
- changed returned subject to a map with 3 flavors of subject

v0.0.4
------
- updated API to allow more custom build of the generator by passing dependencies as param

v0.0.3
v0.0.2
------
- setup and tests of the build system

v0.0.1
------
- early implementation
