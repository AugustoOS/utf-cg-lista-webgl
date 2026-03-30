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

let n_vertex = 3;
let vertices;
let vbo = null;

function update_poly() {
    const vertexArray = [];
    const angleStep = (360 / n_vertex) * Math.PI / 180;
    const radius = 100;

    for(let i = 0; i < n_vertex; i++) {
        const angle = angleStep * i + Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertexArray.push(x, y, 0);
    }

    vertices = new Float32Array(vertexArray);

    if (vbo) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowRight")
    {
        n_vertex++;
        update_poly();
    }  
});

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" && n_vertex > 3)
    {
        n_vertex--;
        update_poly();
    }  
});

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

    const proj_matrix = ortho(-250, 250, -250, 250, -1, 1); // canvas 500x500x2

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    vbo = gl.createBuffer();
    
    update_poly();
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

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
        gl.uniform3fv(colorUniformLoc, [0, 0, 0]);
        gl.drawArrays(gl.LINE_LOOP, 0, n_vertex);
        gl.uniform3fv(colorUniformLoc, [1, 0.1, 0.1]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, n_vertex);

        requestAnimationFrame(render);
    }

    render();

}

main();