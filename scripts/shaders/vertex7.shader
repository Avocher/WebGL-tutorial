precision highp float;

attribute vec3 aPosition;
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal;

uniform mat4 uMVP;
uniform mat4 uV;
uniform mat4 uM;
uniform vec3 uLightPosition_worldspace;

varying highp vec2 vTextureCoord; //vUV
varying highp vec3 vPosition_worldspace;
varying highp vec3 vNormal_cameraspace;
varying highp vec3 vEyeDirection_cameraspace;
varying highp vec3 vLightDirection_cameraspace;

void main() {
    gl_Position = uMVP * vec4(aPosition, 1.0);

    vPosition_worldspace = (uM * vec4(aPosition,1)).xyz;

    vec3 aPosition = ( uV * uM * vec4(aPosition,1)).xyz;
    vEyeDirection_cameraspace = vec3(0,0,0) - aPosition;

    vec3 LightPosition_cameraspace = ( uV * vec4(uLightPosition_worldspace, 1)).xyz;
    vLightDirection_cameraspace = LightPosition_cameraspace + vEyeDirection_cameraspace;

    vNormal_cameraspace = ( uV * uM * vec4(aVertexNormal,0)).xyz;

    vTextureCoord = aTextureCoord;
}
