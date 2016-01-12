precision highp float;

varying highp vec2 vTextureCoord; //vUV
varying highp vec3 vPosition_worldspace;
varying highp vec3 vNormal_cameraspace;
varying highp vec3 vEyeDirection_cameraspace;
varying highp vec3 vLightDirection_cameraspace;

uniform sampler2D uSampler;

uniform mat4 uMV;
uniform vec3 uLightPosition_worldspace;

void main() {

    vec3 LightColor = vec3(1,1,1);
    float LightPower = 50.0;

    vec3 MaterialDiffuseColor = texture2D( uSampler, vTextureCoord ).rgb;
    vec3 MaterialAmbientColor = vec3(0.1,0.1,0.1) * MaterialDiffuseColor;
    vec3 MaterialSpecularColor = vec3(0.3,0.3,0.3);

    float distance = length( uLightPosition_worldspace - vPosition_worldspace );

    vec3 n = normalize( vNormal_cameraspace );
    vec3 l = normalize( vLightDirection_cameraspace );
    float cosTheta = clamp( dot( n,l ), 0.0,1.0 );

    vec3 E = normalize(vEyeDirection_cameraspace);
    vec3 R = reflect(-l,n);
    float cosAlpha = clamp( dot( E,R ), 0.0,1.0 );

    gl_FragColor = vec4((MaterialAmbientColor + MaterialDiffuseColor * LightColor * LightPower * cosTheta / (distance*distance) + MaterialSpecularColor * LightColor * LightPower * pow(cosAlpha,5.0) / (distance*distance)),1);
}
