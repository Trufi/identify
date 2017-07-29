import { mat4 } from 'gl-matrix';

const key = ({x, y, z}) => `${x}_${y}_${z}`;

export default class Cube {
    constructor() {
        this.position = [0, 0, 0];
        this.size = [1, 1, 1];
        this.color = [1, 0, 0, 1];
        this.uniqColor = [1, 1, 1, 1];
        this.buffer = this._generateBuffer();
    }

    _generateBuffer() {
        const vertices = {};
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    vertices[key({x, y, z})] = this._generateVertex(x, y, z);
                }
            }
        }

        const faces = [
            this._generateFace(-1, 'x', 'y', vertices),
            this._generateFace(1, 'x', 'y', vertices),
            this._generateFace(-1, 'x', 'z', vertices),
            this._generateFace(1, 'x', 'z', vertices),
            this._generateFace(-1, 'y', 'z', vertices),
            this._generateFace(1, 'y', 'z', vertices)
        ];

        const orderedVertices = faces.reduce((prev, current) => prev.concat(current), []);
        const array = orderedVertices.reduce((prev, current) => prev.concat(current), []);
        const typedArray = new Float32Array(array);
        return typedArray.buffer;
    }

    //           -1  0  0
    _generateFace(val, a, b, vertices) {
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
            
            return vertices[key(v)]
        });
    }

    _generateVertex(x, y, z) {
        return [
            x * this.size[0],
            y * this.size[1],
            z * this.size[2]
        ].concat(
            this.color,
            this.uniqColor
        );
    }
}