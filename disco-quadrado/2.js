let press = false;

document.addEventListener("keydown", (e) => {
    if (e.code === "KeyC") press = true;
});

document.addEventListener("keyup", (e) => {
    if (e.code === "KeyC") press = false; 
});

async function main() {
    const program = await createProgram("shaders/vertex.glsl", "shaders/fragment.glsl");
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
    setupGL();

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