var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                             document.mozExitPointerLock ||
                             document.webkitExitPointerLock;

canvas.onclick = function() {
    canvas.requestPointerLock();
}

var lastTime = new Date();
var deltaTime = 0;

var position = Vector.create([4,3,3]);
var horizontalAngle = 3.14;
var verticalAngle = 0.0;
var right = Vector.create(
    [
        Math.sin(horizontalAngle - 3.14/2.0),
        0,
        Math.cos(horizontalAngle - 3.14/2.0)
    ]);

var initalFoV = 45.0;
var speed = 3.0;
var mouseSpeed = 0.05;

var direction = Vector.create([0,0,0]);
var up = Vector.create([0,1,0]);

var gl = canvas.getContext('webgl');
var program = gl.createProgram();

gl.clearColor(1, 1, 1, 1);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

initializeShaders(gl, program);
initalizeBuffers(gl);
initializeTextures(gl);


function draw() {

    var currentTime = new Date();

    deltaTime = (currentTime.getTime() - lastTime.getTime())/1000;

    var projection = makePerspective(
                                45,
                                canvas.width/canvas.height,
                                0.1,
                                100.0
                            );
    var view = makeLookAt(
                        position.e(0),position.e(1),position.e(2),
                        position.e(0)+direction.e(0),position.e(1)+direction.e(1),position.e(2)+direction.e(2),
                        up.e(0),up.e(1), up.e(2)
                    );

    var model = Matrix.I(4);
    var mvp = projection.x(view.x(model));

    //VERTICES
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);

    //Texture Coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, this.UVBuffer);
    gl.vertexAttribPointer(program.textureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniformMatrix4fv(program.mvp, false, new Float32Array( mvp.flatten() ));

    program.mvp = gl.getUniformLocation(program, 'uMVP');
    gl.uniform1i(gl.getUniformLocation(program, 'uSampler'), 0);

    gl.drawArrays(gl.TRIANGLES, 0, 12*3);

    lastTime = currentTime;
}

function lockChangeAlert() {
  if(document.pointerLockElement === canvas ||
  document.mozPointerLockElement === canvas) {
    document.addEventListener("mousemove", mouseInput, false);
    document.addEventListener("keydown", keyInput, false);
  } else {
    document.removeEventListener("mousemove", mouseInput, false);
  }
}

function keyInput(event) {
    if(event.keyCode == 65){ //A
        position = position.subtract(right.x(deltaTime).x(speed));
    } else if(event.keyCode == 83){ //S
        position = position.subtract(direction.x(deltaTime).x(speed));
    }else if(event.keyCode == 68){ //D
        position = position.add(right.x(deltaTime).x(speed));
    }else if(event.keyCode == 87){ //W
        position = position.add(direction.x(deltaTime).x(speed));
    }
}

function mouseInput(event) {

    var movementX = event.movementX ||
        event.mozMovementX          ||
        0;

    var movementY = event.movementY ||
        event.mozMovementY      ||
        0;

    horizontalAngle += mouseSpeed * deltaTime * -movementX;
    verticalAngle   += mouseSpeed * deltaTime * -movementY;

    direction = Vector.create(
        [
            Math.cos(verticalAngle) * Math.sin(horizontalAngle),
            Math.sin(verticalAngle),
            Math.cos(verticalAngle) * Math.cos(horizontalAngle)
        ]);

    right = Vector.create(
        [
            Math.sin(horizontalAngle - 3.14/2.0),
    		0,
    		Math.cos(horizontalAngle - 3.14/2.0)
        ]);

    up = right.cross(direction);

}

function initializeTextures(gl) {
    var ext = gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
    this.texture = loadDDSTexture(gl, ext, "texture.dds", function(){setInterval(draw, 15);});
}

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

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    uv =
    [
        0.000059, 0.000004,
        0.000103, 0.336048,
        0.335973, 0.335903,
        1.000023, 0.000013,
        0.667979, 0.335851,
        0.999958, 0.336064,
        0.667979, 0.335851,
        0.336024, 0.671877,
        0.667969, 0.671889,
        1.000023, 0.000013,
        0.668104, 0.000013,
        0.667979, 0.335851,
        0.000059, 0.000004,
        0.335973, 0.335903,
        0.336098, 0.000071,
        0.667979, 0.335851,
        0.335973, 0.335903,
        0.336024, 0.671877,
        1.000004, 0.671847,
        0.999958, 0.336064,
        0.667979, 0.335851,
        0.668104, 0.000013,
        0.335973, 0.335903,
        0.667979, 0.335851,
        0.335973, 0.335903,
        0.668104, 0.000013,
        0.336098, 0.000071,
        0.000103, 0.336048,
        0.000004, 0.671870,
        0.336024, 0.671877,
        0.000103, 0.336048,
        0.336024, 0.671877,
        0.335973, 0.335903,
        0.667969, 0.671889,
        1.000004, 0.671847,
        0.667979, 0.335851
    ];

    this.UVBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.UVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
}

function initializeShaders(gl, program) {
    var vertexShader = getShader(gl, 'shader-vs');
    var fragmentShader = getShader(gl, 'shader-fs');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    program.position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(program.position);

    program.textureCoord = gl.getAttribLocation(program, 'aTextureCoord');
    gl.enableVertexAttribArray(program.textureCoord);

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
