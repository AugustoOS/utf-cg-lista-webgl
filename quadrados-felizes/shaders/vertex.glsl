#version 300 es

in vec3 position;
uniform mat4 proj;
uniform mat4 square_trans;

void main() {
    gl_Position = proj*square_trans*vec4(position, 1.0);
}