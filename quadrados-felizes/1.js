async function main() {
    const program = await createProgram("shaders/vertex.glsl", "shaders/fragment.glsl");
    gl.useProgram(program);
    setupGL();

    const vertices = new Float32Array([
        -25, 25, 0,  // v0
        -25, -25, 0,  // v1
        25, -25, 0,  // v2
        25, 25, 0   // v3
    ]);

    const proj_matrix = ortho(-250, 250, -250, 250, -1, 1); // canvas 500x500x2

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const transUniformLoc = gl.getUniformLocation(program, 'square_trans');
    const colorUniformLoc = gl.getUniformLocation(program, 'square_color');

    const positionAttributeLocation = gl.getAttribLocation(program, 'position');

    const projUniformLoc = gl.getUniformLocation(program, 'proj');
    gl.uniformMatrix4fv(projUniformLoc, false, proj_matrix);

    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var trans;
    var color;
    var current_color = 0;

    const colors = [
        [0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 0.0],
        [1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0],
        [0.6, 0.6, 0.6],
        [1.0, 1.0, 1.0]
    ];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            trans = translation(123 * i, 123 * j, 0);
            gl.uniformMatrix4fv(transUniformLoc, false, trans);
            color = colors[current_color];
            current_color++;
            gl.uniform3fv(colorUniformLoc, color);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
    }

}

main();