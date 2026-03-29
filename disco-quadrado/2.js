const canvas = document.querySelector('.canvas');
const gl = canvas.getContext('webgl2');

async function loadShader(path) {
    const response = await fetch(path);
    return await response.text();
}

if (!gl) {
    console.error('WebGL2 não está disponível');
    throw new Error('WebGL2 não suportado');
}

function translation(tx, ty, tz) {  //translação do object
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1]);
}


function ortho(l, r, b, t, n, f) {  //left, right, bottom, top, near, far

    const mx = 2 / (r - l);
    const my = 2 / (t - b);
    const mz = -2 / (f - n); //no webgl se usa orientação mão direita, por isso é negativo
    const tx = -(r + l) / (r - l);
    const ty = -(t + b) / (t - b);
    const tz = -(f + n) / (f - n);

    return new Float32Array([mx, 0, 0, 0, 0, my, 0, 0, 0, 0, mz, 0, tx, ty, tz, 1]); // column order
}

let press = false;

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyC") press = true;
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyC") press = false; 
});

async function main() {

    const vertexShaderCode = await loadShader("shaders/vertex.glsl");
    const fragmentShaderCode = await loadShader("shaders/fragment.glsl");

    const createShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }

        return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderCode));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShaderCode));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    const vertices = new Float32Array([ // esse zigue zague vai guiar o triangles strip para desenhar o quadrado
        -200, 200, 0,  // v1
        -100, 100, 0,  // v2
        -200, -200, 0,  // v3
        -100, -100, 0,  // v4
        200, -200, 0,  // v5
        100, -100, 0,  // v6
        200, 200, 0,   // v7
        100, 100, 0,   // v8
        -200, 200, 0,  // v9
        -100, 100, 0  // v10
    ]);

    const index1 = new Uint16Array([0, 2, 4, 6]);   // para fazer os contornos dos quadrados com IBO's, o primeiro é para o quadrado maior
    const index2 = new Uint16Array([3, 5, 7, 9]);

    const proj_matrix = ortho(-250, 250, -250, 250, -1, 1); // canvas 500x500x2

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const ibo1 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo1);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index1, gl.STATIC_DRAW);

    const ibo2 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo2);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index2, gl.STATIC_DRAW);

    const colorUniformLoc = gl.getUniformLocation(program, 'color');
    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    const projUniformLoc = gl.getUniformLocation(program, 'proj');

    gl.uniformMatrix4fv(projUniformLoc, false, proj_matrix);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.uniform3fv(colorUniformLoc, [0.61, 0.83, 0.83]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);

        gl.uniform3fv(colorUniformLoc, [0, 0, 0]);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo1);
        gl.drawElements(gl.LINE_LOOP, index1.length, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo2);
        gl.drawElements(gl.LINE_LOOP, index2.length, gl.UNSIGNED_SHORT, 0);

        if (press) {
            gl.uniform3fv(colorUniformLoc, [0, 0, 0]);
            gl.drawArrays(gl.LINE_STRIP, 0, 10);
        }

        requestAnimationFrame(render);
    }

    render();

}

main();