# Genetic-Algorithm-Demo
This demo is written for the discussion of the mob evolution method of the project: https://github.com/willy418785/PCG

## To Build

### Build Requirement

* tsc
* browserify
* (optional) watchify

### Build Process

#### Recommended way

1. `tsc -w`
2. `watchify ./ts-built/main.js -o ./build/bundle.js`

#### The other way

1. `tsc ./src/<every_ts_file> --outDir ./ts-built/`
2. `browserify ./ts-built/main.js -o ./build/bundle.js`