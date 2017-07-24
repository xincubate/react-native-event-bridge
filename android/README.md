README
======

Steps before publishing a new version to npm:

- update the version in build.gradle under configureReactNativePom -> version
- delete the `maven` folder
- run `sudo ./gradlew installArchives`
- verify that latest set of generated files is in the maven folder with the correct version number
