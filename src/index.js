import { mat4 } from 'gl-matrix';
import Cube from './cube';

const vertexShaderCode = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    uniform mat4 u_camera;
    varying vec3 v_color;
    void main(void) {
        v_color = a_color;
        gl_Position = u_camera * vec4(a_position, 1.0);
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
const aPosition = gl.getAttribLocation(program, 'a_position');
const aColor = gl.getAttribLocation(program, 'a_color');

const cameraMatrix = mat4.create();
mat4.perspective(cameraMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 1000);
const lookAtMatrix = mat4.create();

const zoom = 50;
mat4.lookAt(lookAtMatrix, [-zoom, -zoom, zoom], [0, 0, 0], [0, 0, 1]);
mat4.mul(cameraMatrix, cameraMatrix, lookAtMatrix);

const k = 20;
const padding = 5;
const middle = k / 2;
const cubes = [];
for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
        const cube = new Cube([
            (i - middle) * (1 + padding),
            (j - middle) * (1 + padding),
            0
        ]);
        cubes.push(cube);
    }
}

function batching(cubes) {
    const BYTES_PER_CUBE = 11 * 4 * 36;
    const array = new Uint8Array(BYTES_PER_CUBE * cubes.length);
    cubes.forEach((cube, i) => {
        array.set(new Uint8Array(cube.buffer), i * BYTES_PER_CUBE);
    });
    return array.buffer;
}

const glBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
gl.bufferData(gl.ARRAY_BUFFER, batching(cubes), gl.STATIC_DRAW);

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
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 11 * 4, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 11 * 4, 3 * 4);

    gl.uniformMatrix4fv(uCamera, false, cameraMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 36 * cubes.length);

    // lastRenderTime = time;
}

render();