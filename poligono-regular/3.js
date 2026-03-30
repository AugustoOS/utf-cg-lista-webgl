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

async function main() {
    const program = await createProgram("shaders/vertex.glsl", "shaders/fragment.glsl");
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
    setupGL();

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