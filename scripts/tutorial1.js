"use strict";

define(
    ["tools/glUtils",
    "tools/sylvester",
    "tools/myUtils",
    "text!shaders/fragment1.shader",
    "text!shaders/vertex1.shader"
    ],

    function (glUtils, sylvester, myUtils, fragmentShader, vertexShader) {

        var canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);

        var gl = canvas.getContext('webgl');

        gl.clearColor(0, 0, 0.4, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var shaders = createShaders(gl, vertexShader, fragmentShader);

        var program = gl.createProgram();

        gl.attachShader(program, shaders.vertexShader);
        gl.attachShader(program, shaders.fragmentShader);
        gl.linkProgram(program);

        var vertices = new Float32Array(
            [
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
                0.0, 1.0, 0.0,
            ]
        )

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(program);

        program.color = gl.getUniformLocation(program, 'color');
        gl.uniform4fv(program.color, [1, 0, 0, 1.0]);

        program.position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(program.position);
        gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
});
