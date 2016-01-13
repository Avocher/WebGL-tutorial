"use strict";

define(
    [
        "tools/gl-matrix",
        "tools/myUtils",
        "text!shaders/fragment3.shader",
        "text!shaders/vertex3.shader"
    ],

    function (glMatrix, myUtils, fragmentShader, vertexShader) {

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var gl = canvas.getContext('webgl');

    gl.clearColor(0, 0, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

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

    program.position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(program.position);
    program.mvp = gl.getUniformLocation(program, 'mvp');

    program.color = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(program.color);


    //VERTICES
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(program.mvp, false, new Float32Array( mvp ));

    //COLORS
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.colorBuffer);
    gl.vertexAttribPointer(program.color, 3, gl.FLOAT, false, 0, 0);


    gl.drawArrays(gl.TRIANGLES, 0, 12*3);

    function initalizeBuffers(gl) {
        var vertices =
            [
                -1.0,-1.0,-1.0,
                -1.0,-1.0, 1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0,-1.0,
                -1.0,-1.0,-1.0,
                -1.0, 1.0,-1.0,
                1.0,-1.0, 1.0,
                -1.0,-1.0,-1.0,
                1.0,-1.0,-1.0,
                1.0, 1.0,-1.0,
                1.0,-1.0,-1.0,
                -1.0,-1.0,-1.0,
                -1.0,-1.0,-1.0,
                -1.0, 1.0, 1.0,
                -1.0, 1.0,-1.0,
                1.0,-1.0, 1.0,
                -1.0,-1.0, 1.0,
                -1.0,-1.0,-1.0,
                -1.0, 1.0, 1.0,
                -1.0,-1.0, 1.0,
                1.0,-1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0,-1.0,-1.0,
                1.0, 1.0,-1.0,
                1.0,-1.0,-1.0,
                1.0, 1.0, 1.0,
                1.0,-1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0,-1.0,
                -1.0, 1.0,-1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0,-1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,
                1.0,-1.0, 1.0
            ];

        gl.vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var colors =
            [
                0.583,  0.771,  0.014,
                0.609,  0.115,  0.436,
                0.327,  0.483,  0.844,
                0.822,  0.569,  0.201,
                0.435,  0.602,  0.223,
                0.310,  0.747,  0.185,
                0.597,  0.770,  0.761,
                0.559,  0.436,  0.730,
                0.359,  0.583,  0.152,
                0.483,  0.596,  0.789,
                0.559,  0.861,  0.639,
                0.195,  0.548,  0.859,
                0.014,  0.184,  0.576,
                0.771,  0.328,  0.970,
                0.406,  0.615,  0.116,
                0.676,  0.977,  0.133,
                0.971,  0.572,  0.833,
                0.140,  0.616,  0.489,
                0.997,  0.513,  0.064,
                0.945,  0.719,  0.592,
                0.543,  0.021,  0.978,
                0.279,  0.317,  0.505,
                0.167,  0.620,  0.077,
                0.347,  0.857,  0.137,
                0.055,  0.953,  0.042,
                0.714,  0.505,  0.345,
                0.783,  0.290,  0.734,
                0.722,  0.645,  0.174,
                0.302,  0.455,  0.848,
                0.225,  0.587,  0.040,
                0.517,  0.713,  0.338,
                0.053,  0.959,  0.120,
                0.393,  0.621,  0.362,
                0.673,  0.211,  0.457,
                0.820,  0.883,  0.371,
                0.982,  0.099,  0.879
            ];

        gl.colorBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }


    function initializeShaders(gl, program, vertexShaderCode, fragmentShaderCode) {

        var shaders = createShaders(gl, vertexShaderCode, fragmentShaderCode);

        gl.attachShader(program, shaders.vertexShader);
        gl.attachShader(program, shaders.fragmentShader);

        gl.linkProgram(program);
        gl.useProgram(program);

    }
});
