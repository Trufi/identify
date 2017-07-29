import { mat4 } from 'gl-matrix';
import Cube, { BYTES_PER_VERTEX, VERTICES_PER_CUBE } from './cube';
var compileShader = WebGLRenderingContext.prototype.compileShader;

WebGLRenderingContext.prototype.compileShader = function(shader) {
    compileShader.call(this, shader);

    if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
        console.log(this.getShaderInfoLog(shader));
    }
};

var linkProgram = WebGLRenderingContext.prototype.linkProgram;
WebGLRenderingContext.prototype.linkProgram = function(program) {
    linkProgram.call(this, program);

    if (!this.getProgramParameter(program, this.LINK_STATUS)) {
        console.error(this.getProgramInfoLog(program));
    }
};
const vertexShaderCode = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    attribute float a_shift;
    uniform mat4 u_camera;
    uniform float u_time;
    varying vec3 v_color;
    void main(void) {
        v_color = a_color;
        gl_Position = u_camera * vec4(a_position.xy, a_position.z + sin((a_shift + u_time / 50.) / 3.0) * 3.0, 1.0);
    }
`;

const fragmentShaderCode = `
    precision mediump float;
    varying vec3 v_color;
    void main(void) {
        gl_FragColor = vec4(v_color.rgb, 1.0);
    }
`;

// Инициализация canvas и получение из него WebGL контекста
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl');

// Устанавливаем размеры canvas и вьюпорт у WebGL
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, window.innerWidth, window.innerHeight);

// Инициализация шейдеров
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderCode);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderCode);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Получим местоположение переменных в программе шейдеров
const uCamera = gl.getUniformLocation(program, 'u_camera');
const uTime = gl.getUniformLocation(program, 'u_time');
const aPosition = gl.getAttribLocation(program, 'a_position');
const aColor = gl.getAttribLocation(program, 'a_color');
const aShift = gl.getAttribLocation(program, 'a_shift');

const cameraMatrix = mat4.create();
mat4.perspective(cameraMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 1000);
const lookAtMatrix = mat4.create();

const zoom = 50;
mat4.lookAt(lookAtMatrix, [-100, 90, 30], [-50, 50, 0], [0, 0, 1]);
mat4.mul(cameraMatrix, cameraMatrix, lookAtMatrix);

const k = 40;
const padding = 5;
const middle = k / 2;
const cubes = [];
for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
        const cube = new Cube([
            (i - middle) * (1 + padding),
            (j - middle) * (1 + padding),
            0
        ], i + j);
        cubes.push(cube);
    }
}

function batching(cubes) {
    const array = new Uint8Array(BYTES_PER_VERTEX * VERTICES_PER_CUBE * cubes.length);
    cubes.forEach((cube, i) => {
        array.set(new Uint8Array(cube.buffer), i * BYTES_PER_VERTEX * VERTICES_PER_CUBE);
    });
    return array.buffer;
}

const glBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
gl.bufferData(gl.ARRAY_BUFFER, batching(cubes), gl.STATIC_DRAW);

const startTime = Date.now();
// let lastRenderTime = Date.now();

function render() {
    // Запрашиваем рендеринг на следующий кадр
    requestAnimationFrame(render);

    // Получаем время прошедшее с прошлого кадра
    const time = Date.now();
    // const dt = lastRenderTime - time;

    // Очищаем сцену, закрашивая её в белый цвет
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Включаем фильтр глубины
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, BYTES_PER_VERTEX, 0);

    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, BYTES_PER_VERTEX, 3 * 4);

    gl.enableVertexAttribArray(aShift);
    gl.vertexAttribPointer(aShift, 1, gl.FLOAT, false, BYTES_PER_VERTEX, 11 * 4);

    gl.uniformMatrix4fv(uCamera, false, cameraMatrix);
    gl.uniform1f(uTime, time - startTime);

    gl.drawArrays(gl.TRIANGLES, 0, VERTICES_PER_CUBE * cubes.length);

    // lastRenderTime = time;
}

render();