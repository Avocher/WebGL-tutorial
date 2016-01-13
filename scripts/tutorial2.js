"use strict";

define(
    [
        "tools/gl-matrix",
        "tools/myUtils",
        "text!shaders/fragment2.shader",
        "text!shaders/vertex2.shader"
    ],

    function (glMatrix, myUtils, fragmentShader, vertexShader) {

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var gl = canvas.getContext('webgl');

    gl.clearColor(0, 0, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var program = gl.createProgram();

    initializeShaders(gl, program, vertexShader, fragmentShader);
    initalizeBuffers(gl);


    var projection = glMatrix.mat4.create();
    var view = glMatrix.mat4.create();
    var model = glMatrix.mat4.create();
    var mvp = glMatrix.mat4.create();
    var tmp = glMatrix.mat4.create();


    glMatrix.mat4.perspective(
                                projection,
                                45*Math.PI/2.0,
                                canvas.width/canvas.height,
                                0.1,
                                100.0
                            );

    glMatrix.mat4.lookAt(
                        view,
                        [4,3,3],
                        [0,0,0],
                        [0,1,0]
                    );
    glMatrix.mat4.identity(model);
    glMatrix.mat4.mul(tmp, view, model);
    glMatrix.mat4.mul(mvp, projection, tmp);

    program.color = gl.getUniformLocation(program, 'color');
    gl.uniform4fv(program.color, [1, 0, 0, 1.0]);

    program.mvp = gl.getUniformLocation(program, 'mvp');
    gl.uniformMatrix4fv(program.mvp, false, new Float32Array(mvp));

    program.position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(program.position);
    gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

});

function initalizeBuffers(gl) {
    var vertices =
        [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            0.0, 1.0, 0.0,
        ]

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function initializeShaders(gl, program, vertexShaderCode, fragmentShaderCode) {

    var shaders = createShaders(gl, vertexShaderCode, fragmentShaderCode);

    gl.attachShader(program, shaders.vertexShader);
    gl.attachShader(program, shaders.fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);
}
