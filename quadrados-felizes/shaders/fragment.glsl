#version 300 es

precision highp float;

out vec4 outColor;
uniform vec3 square_color;

void main() {
    outColor = vec4(square_color, 1.0);
}
