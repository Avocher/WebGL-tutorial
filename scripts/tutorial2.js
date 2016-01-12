"use strict";

define(
    ["tools/glUtils",
    "tools/sylvester",
    "tools/myUtils",
    "text!shaders/fragment2.shader",
    "text!shaders/vertex2.shader"
    ],

    function (glUtils, sylvester, myUtils, fragmentShader, vertexShader) {

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



    var projection = makePerspective(
                                45,
                                canvas.width/canvas.height,
                                0.1,
                                100.0
                            );
    var view = makeLookAt(
                        4,3,3,
                        0,0,0,
                        0,1,0
                    );
    var model = Matrix.I(4);

    var mvp = projection.x(view.x(model));

    program.color = gl.getUniformLocation(program, 'color');
    gl.uniform4fv(program.color, [1, 0, 0, 1.0]);

    program.mvp = gl.getUniformLocation(program, 'mvp');
    gl.uniformMatrix4fv(program.mvp, false, new Float32Array(mvp.flatten() ));

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
