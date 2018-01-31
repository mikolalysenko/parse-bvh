parse-bvh
=========
Parses BioVision Hierarchy (BVH) motion capture files into a JavaScript friendly object representation.

More info on BVH:

* https://research.cs.wisc.edu/graphics/Courses/cs-838-1999/Jeff/BVH.html
* https://en.wikipedia.org/wiki/Biovision_Hierarchy

# example

```javascript
const fs = require('fs')
const parseBVH = require('parse-bvh')

console.log(parseBVH(fs.readFileSync('example.bvh').toString()))
```

# install

```
npm install bvh-parser
```

# api

#### `require('parse-bvh')(bvhString)`
Takes a BVH file as a string as input

* `bvhString` is the contents of a BVH file

**Returns** An object representing the data contained in the BVH file.  It has the following properties:

* `joints` an array of all the joints in the file, sorted by order of occurrence in the biovision file.  Each joint has the following properties:
    * `name` the name of the joint
    * `index` index of the joint in the `joints` array
    * `offset` a 3D vector offset of the joint
    * `channels` the parameters describing the joint
    * `channelOffset` start of the channel offset in the joint
    * `parent` reference to parent joint
    * `children` an array of all child joints for a given joint
* `frameTime` the number of seconds/frame in an animation
* `frames` an array of frames.  each frame is a flat array of all channel data for each joint

# credits
(c) 2018 Mikola Lysenko. MIT License