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

var position = Vector.create([0,0,5]);
var horizontalAngle = Math.PI;
var verticalAngle = 0.0;
var right = Vector.create(
    [
        Math.sin(horizontalAngle - Math.PI/2.0),
        0,
        Math.cos(horizontalAngle - Math.PI/2.0)
    ]);

var FoV = 45.0;
var speed = 3.0;
var mouseSpeed = 0.05;

var direction = Vector.create([0,0,-1]);
var up = Vector.create([0,1,0]);

var gl = canvas.getContext('webgl');
var program = gl.createProgram();

gl.clearColor(0, 0, 0.4, 1);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.CULL_FACE);

var obj = loadOBJ();

initializeShaders(gl, program);
initalizeBuffers(gl, obj);
initializeTextures(gl);


function draw() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var currentTime = new Date();

    deltaTime = (currentTime.getTime() - lastTime.getTime())/1000;

    var projection = makePerspective(
                                FoV,
                                canvas.width/canvas.height,
                                0.1,
                                100.0
                            );

    var temp = position.add(direction);

    var view = makeLookAt(
                        position.elements[0],position.elements[1],position.elements[2],
                        temp.elements[0], temp.elements[1], temp.elements[2],
                        up.elements[0], up.elements[1], up.elements[2]
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

    //NORMALS
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(program.normal, 3, gl.FLOAT, false, 0, 0);

    gl.uniform1i(gl.getUniformLocation(program, 'uSampler'), 0);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.uniformMatrix4fv(program.mvp, false, new Float32Array( mvp.flatten() ));
    gl.uniformMatrix4fv(program.v, false, new Float32Array( view.flatten() ));
    gl.uniformMatrix4fv(program.m, false, new Float32Array( model.flatten() ));
    gl.uniform3fv(program.lightposition_world, new Float32Array( [4,4,4]));

    gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length/3);

    lastTime = currentTime;
}

function lockChangeAlert() {
  if(document.pointerLockElement === canvas ||
  document.mozPointerLockElement === canvas) {
    document.addEventListener("mousemove", mouseInput, false);
    document.addEventListener("keydown", keyInput, false);
    document.addEventListener("mousewheel", wheelInput, false);
  } else {
    document.removeEventListener("mousemove", mouseInput, false);
    document.removeEventListener("keydown", keyInput, false);
    document.removeEventListener("mousewheel", wheelInput, false);
  }
}

function keyInput(event) {
    if(event.keyCode == 65) { //A
        position = position.subtract(right.x(deltaTime).x(speed));
    } else if(event.keyCode == 83) { //S
        position = position.subtract(direction.x(deltaTime).x(speed));
    }else if(event.keyCode == 68) { //D
        position = position.add(right.x(deltaTime).x(speed));
    }else if(event.keyCode == 87) { //W
        position = position.add(direction.x(deltaTime).x(speed));
    }
}

function wheelInput(event) {
    if (event.wheelDelta >= 120)
        FoV += 5;
    else if (event.wheelDelta <= -120)
        FoV -= 5;
    return false;
}

function mouseInput(event) {

    var movementX = event.movementX ||
        event.mozMovementX          ||
        0;

    var movementY = event.movementY ||
        event.mozMovementY      ||
        0;

    horizontalAngle += mouseSpeed * deltaTime * movementX;
    verticalAngle   += mouseSpeed * deltaTime * movementY;

    direction = Vector.create(
        [
            Math.cos(verticalAngle) * Math.sin(horizontalAngle),
            Math.sin(verticalAngle),
            Math.cos(verticalAngle) * Math.cos(horizontalAngle)
        ]);

    right = Vector.create(
        [
            Math.sin(horizontalAngle - Math.PI/2.0),
    		0,
    		Math.cos(horizontalAngle - Math.PI/2.0)
        ]);

    up = right.cross(direction);

}

function initializeTextures(gl) {
    var ext = gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
    this.texture = loadDDSTexture(gl, ext, "uvmap2.dds", function(){setInterval(draw, 15);});
}

function initalizeBuffers(gl, obj) {

    this.vertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);


    this.UVBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.UVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.uvs), gl.STATIC_DRAW);

    this.normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW);
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

    program.normal = gl.getAttribLocation(program, 'aVertexNormal');
    gl.enableVertexAttribArray(program.normal);

    program.mvp = gl.getUniformLocation(program, 'uMVP');
    program.v = gl.getUniformLocation(program, 'uV');
    program.m = gl.getUniformLocation(program, 'uM');
    program.lightposition_world = gl.getUniformLocation(program, 'uLightPosition_worldspace');
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

function loadOBJ() {
    var objfile = document.getElementById("model");
    if (!objfile) {
        return null;
    }

    var model = {
        vertices : [],
        uvs : [],
        normals : [],
    };

    var tmp_v = [];
    var tmp_uv = [];
    var tmp_vn = [];
    var tmp_f = [];

    var v_index = [];
    var uv_index = [];
    var vn_index = [];


    var k = objfile.firstChild;
    var string = k.textContent;
    var lines = string.split("\n");

    for (index = 0; index < lines.length; ++index) {

        var line = lines[index].split(" ");
        if (line[0] == "v") {
            var vertex = {
                x : line[1],
                y : line[2],
                z : line[3],
            }
            tmp_v.push(vertex);

        }else if (line[0] == "vt") {
            var uv = {
                u : line[1],
                v : line[2],
            }
            tmp_uv.push(uv);

        }else if (line[0] == "vn") {
            var normal = {
                x : line[1],
                y : line[2],
                z : line[3],
            }
            tmp_vn.push(normal);

        }else if (line[0] == "f") {
            var a1 = line[1].split("/");
            var a2 = line[2].split("/");
            var a3 = line[3].split("/");

            v_index.push(a1[0]);
            v_index.push(a2[0]);
            v_index.push(a3[0]);

            uv_index.push(a1[1]);
            uv_index.push(a2[1]);
            uv_index.push(a3[1]);

            vn_index.push(a1[2]);
            vn_index.push(a2[2]);
            vn_index.push(a3[2]);
        }
    }

    for (index = 0; index < v_index.length; ++index) {

        var vertex = tmp_v[v_index[index]-1];

        model.vertices.push(vertex.x);
        model.vertices.push(vertex.y);
        model.vertices.push(vertex.z);

        var uv = tmp_uv[uv_index[index]-1];

        model.uvs.push(uv.u);
        model.uvs.push(-uv.v);

        var normal = tmp_vn[vn_index[index]-1];

        model.normals.push(normal.x);
        model.normals.push(normal.y);
        model.normals.push(normal.z);

    }
    return model;
}
