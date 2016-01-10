var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

var gl = canvas.getContext('webgl');

gl.clearColor(0, 0, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
var program = gl.createProgram();

initializeShaders(gl, program);
initalizeBuffers(gl);
gl.linkProgram(program);
gl.useProgram(program);


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

program.position = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(program.position);
program.mvp = gl.getUniformLocation(program, 'mvp');

program.color = gl.getAttribLocation(program, 'color');
gl.enableVertexAttribArray(program.color);


//VERTICES
gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
gl.uniformMatrix4fv(program.mvp, false, new Float32Array( mvp.flatten() ));

//COLORS
gl.bindBuffer(gl.ARRAY_BUFFER, gl.colorBuffer);
gl.vertexAttribPointer(program.color, 3, gl.FLOAT, false, 0, 0);


gl.drawArrays(gl.TRIANGLES, 0, 12*3);


function initalizeBuffers(gl) {
    vertices =
        [
            -1.0,-1.0,-1.0, // triangle 1 : begin
            -1.0,-1.0, 1.0,
            -1.0, 1.0, 1.0, // triangle 1 : end
            1.0, 1.0,-1.0, // triangle 2 : begin
            -1.0,-1.0,-1.0,
            -1.0, 1.0,-1.0, // triangle 2 : end
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

    colors =
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


function initializeShaders(gl, program) {
    var vertexShader = getShader(gl, 'shader-vs');
    var fragmentShader = getShader(gl, 'shader-fs');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}
