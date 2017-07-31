export const BYTES_PER_VERTEX = 12 * 4;
export const VERTICES_PER_CUBE = 36;

export default class Cube {
    constructor(position, shift) {
        this.position = position;
        this.size = [1, 1, 1];
        this.color = [1, 0, 0, 1];
        this.faceColors = {
            xy: [1, 0, 0, 1],
            xz: [0, 1, 0, 1],
            yz: [0, 0, 1, 1]
        };
        this.uniqColor = [1, 1, 1, 1];
        this.shift = shift;
        this.buffer = this._generateBuffer();
    }

    _generateBuffer() {
        const faces = [
            this._generateFace(-1, 'x', 'y'),
            this._generateFace(1, 'x', 'y'),
            this._generateFace(-1, 'x', 'z'),
            this._generateFace(1, 'x', 'z'),
            this._generateFace(-1, 'y', 'z'),
            this._generateFace(1, 'y', 'z'),
        ];

        const orderedVertices = faces.reduce((prev, current) => prev.concat(current), []);
        const array = orderedVertices.reduce((prev, current) => prev.concat(current), []);
        const typedArray = new Float32Array(array);
        return typedArray.buffer;
    }

    _generateFace(val, a, b) {
        const v = {
            x: val,
            y: val,
            z: val
        };

        const twoTriangles = [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
            [-1, 1],
            [1, -1]
        ];

        if (val === 1) {
            twoTriangles.reverse();
        }

        return twoTriangles.map(([va, vb]) => {
            v[a] = va;
            v[b] = vb;

            return this._generateVertex(v, this.faceColors[a + b]);
        });
    }

    _generateVertex({x, y, z}, faceColor) {
        return [
            (x + this.position[0]) * this.size[0],
            (y + this.position[1]) * this.size[1],
            (z + this.position[2]) * this.size[2],
        ].concat(
            faceColor,
            this.uniqColor,
            this.shift
        );
    }
}
