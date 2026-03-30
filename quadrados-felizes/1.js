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

function translation(tx, ty, tz) {//translação do object
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

  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.viewport(0, 0, canvas.width, canvas.height);

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