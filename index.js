function Joint (name, index, parent, offset, channels, channelOffset, endSite) {
    this.name = name
    this.index = index
    this.endSite = !!endSite
    this.offset = offset
    this.channels = channels
    this.channelOffset = channelOffset
    this.parent = parent
    this.children = []
}

function parseBVH (bvhFile) {
    var lines = bvhFile.split('\n')
    var linePtr = 0
    var parameterCount = 0

    var joints = []

    function assert (cond, msg) {
        if (!cond) {
            throw new Error(`error parsing bvh (${linePtr}): ${msg}`)
        }
    }

    function rewind () {
        linePtr--
    }

    function getTokens () {
        while (linePtr < lines.length) {
            var toks = lines[linePtr++].trim().split(/\s+/)
            if (toks.length > 0) {
                return toks
            }
        }
        assert(false, 'file is truncated')
    }

    function getLine (prefix) {
        var tokens = getTokens()
        assert(tokens.length > 0 && tokens[0] === prefix, `expected ${prefix}`)
        return tokens.slice(1)
    }

    function parseOffset () {
        var tokens = getLine('OFFSET')
        assert(tokens.length === 3, 'invalid OFFSET')
        return tokens.slice(1).map((x) => parseFloat(x))
    }

    function parseChannels () {
        var tokens = getLine('CHANNELS')
        assert(tokens.length > 2, 'invalid CHANNELS')
        var count = tokens[0] | 0
        assert(count > 0 && count + 1 === tokens.length, 'inconsistent CHANNEL count')
        parameterCount += count
        return tokens.slice(1)
    }

    function parseJointDef (name, parent) {
        getLine('{')
        var offset = parseOffset()
        var channelOffset = parameterCount
        var channels = parseChannels()
        var result = new Joint(name, joints.length, parent, offset, channels, channelOffset, false)
        joints.push(result)
        parseChildren(result.children, result)
        getLine('}')
        return result
    }

    function parseEndSite (parent) {
        getLine('{')
        var offset = parseOffset()
        getLine('}')
        var result = new Joint('', joints.length, parent, offset, [], parameterCount, true)
        joints.push(result)
        return result
    }

    function parseJoint (parent) {
        var tokens = getTokens()
        if (tokens[0] === 'JOINT') {
            return parseJointDef(tokens.slice(1).join(' '), parent)
        } else if (tokens[0] === 'End' && tokens[1] === 'Site') {
            return parseEndSite()
        } else {
            rewind()
            return null
        }
    }

    function parseChildren (children, parent) {
        while (true) {
            var joint = parseJoint(parent)
            if (!joint) {
                return
            }
            children.push(joint)
        }        
    }

    function parseRoot () {
        return parseJointDef(getLine('ROOT').join(' '), null)
    }


    var frames = []
    var frameTime = 0

    function parseFrame () {
        var tokens = getTokens()
        assert(tokens.length === parameterCount, `invalid number of channels for frame ${frames.length}`)
        frames.push(tokens.map((x) => +x))
    }

    function parseMotion () {
        getLine('MOTION')
        var frameTokens = getLine('Frames:')
        var frames = parseFloat(frameTokens[0])
        assert(frames > 0 && frames === (frames | 0), 'invalid frame count')
        var frameTimeTokens = getLine('Frame')
        assert(frameTimeTokens.length === 2 && frameTimeTokens[0] === 'Time:', 'invalid frame time')
        frameTime = +frameTimeTokens[1]
        for (var i = 0; i < frames; ++i) {
            parseFrame()
        }
    }

    getLine('HIERARCHY')
    parseRoot()
    parseMotion()

    return {
        joints,
        frameTime,
        frames,
    }
}

module.exports = parseBVH
