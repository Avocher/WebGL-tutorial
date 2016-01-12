attribute vec3 position;
attribute vec3 color;

uniform mat4 mvp;

varying lowp vec4 vColor;

void main() {
    gl_Position = mvp * vec4(position, 1.0);
    vColor = vec4(color, 1.0);
}
