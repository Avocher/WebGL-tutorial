attribute vec3 aPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVP;

varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uMVP * vec4(aPosition, 1.0);
    vTextureCoord = aTextureCoord;
}
