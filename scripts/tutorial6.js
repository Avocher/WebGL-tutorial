"use strict";

require.config( {
    paths: {
        data: "data",
    }
} );

define(
    [
        "tools/gl-matrix",
        "tools/myUtils",
        "tools/dds",
        "text!shaders/fragment6.shader",
        "text!shaders/vertex6.shader",
        "data!uvmap.dds",
        "text!cube.obj",
    ],

    function (glMatrix, myUtils, dds, fragmentShader, vertexShader, textureData, cubeData) {

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

    var position = glMatrix.vec3.fromValues(0,0,5);
    var horizontalAngle = Math.PI;
    var verticalAngle = 0.0;
    var right = glMatrix.vec3.fromValues(
            Math.sin(horizontalAngle - Math.PI/2.0),
            0,
            Math.cos(horizontalAngle - Math.PI/2.0)
        );

    var FoV = 45*Math.PI/2;
    var speed = 3.0;
    var mouseSpeed = 0.05;

    var direction = glMatrix.vec3.fromValues(0,0,-1);
    var up = glMatrix.vec3.fromValues(0,1,0);

    var gl = canvas.getContext('webgl');
    var program = gl.createProgram();

    gl.clearColor(0, 0, 0.4, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    var obj = loadOBJ(cubeData);

    initializeShaders(gl, program, vertexShader, fragmentShader);
    var buffers = initializeBuffers(gl, obj);
    var texture = initializeTexture(gl, textureData);

    var projection = glMatrix.mat4.create();
    var view = glMatrix.mat4.create();
    var model = glMatrix.mat4.create();
    var mvp = glMatrix.mat4.create();
    var tmp = glMatrix.mat4.create();

    setInterval(draw, 15);


    function draw() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var currentTime = new Date();

        deltaTime = (currentTime.getTime() - lastTime.getTime())/1000;

        glMatrix.mat4.perspective(
                                    projection,
                                    FoV,
                                    canvas.width/canvas.height,
                                    0.1,
                                    100.0
                                );

        var temp = glMatrix.vec3.create()
        glMatrix.vec3.add(temp, position, direction);

        glMatrix.mat4.lookAt(
                            view,
                            position,
                            temp,
                            up
                        );

        glMatrix.mat4.identity(model);
        glMatrix.mat4.mul(tmp, view, model);
        glMatrix.mat4.mul(mvp, projection, tmp);

        //VERTICES
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);

        //Texture Coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.UV);
        gl.vertexAttribPointer(program.textureCoord, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniformMatrix4fv(program.mvp, false, mvp);

        program.mvp = gl.getUniformLocation(program, 'uMVP');
        gl.uniform1i(gl.getUniformLocation(program, 'uSampler'), 0);

        gl.drawArrays(gl.TRIANGLES, 0, obj.vertices.length/3);

        lastTime = currentTime;
    }

    function lockChangeAlert() {
      if(document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas) {
        document.addEventListener("mousemove", mouseInput, false);
        document.addEventListener("keydown", keyInput, false);
        document.addEventListener("wheel", wheelInput, false);
      } else {
        document.removeEventListener("mousemove", mouseInput, false);
        document.removeEventListener("keydown", keyInput, false);
        document.removeEventListener("wheel", wheelInput, false);
      }
    }

    function keyInput(event) {
        var tmp = glMatrix.vec3.create();
        var adjustment = deltaTime*speed;

        if(event.keyCode == 65) { //A
            glMatrix.vec3.scale(tmp, right, adjustment);
            glMatrix.vec3.sub(position, position, tmp);
        } else if(event.keyCode == 83) { //S
            glMatrix.vec3.scale(tmp, direction, adjustment);
            glMatrix.vec3.sub(position, position, tmp);
        }else if(event.keyCode == 68) { //D
            glMatrix.vec3.scale(tmp, right, adjustment);
            glMatrix.vec3.add(position, position, tmp);
        }else if(event.keyCode == 87) { //W
            glMatrix.vec3.scale(tmp, direction, adjustment);
            glMatrix.vec3.add(position, position, tmp);
        }
    }

    function wheelInput(event) {
        if (event.deltaY >= 1)
            FoV += 0.1;
        else if (event.deltaY <= -1)
            FoV -= 0.1;
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

        direction = glMatrix.vec3.fromValues(
                Math.cos(verticalAngle) * Math.sin(horizontalAngle),
                Math.sin(verticalAngle),
                Math.cos(verticalAngle) * Math.cos(horizontalAngle)
            );

        right = glMatrix.vec3.fromValues(
                Math.sin(horizontalAngle - Math.PI/2.0),
        		0,
        		Math.cos(horizontalAngle - Math.PI/2.0)
            );

        glMatrix.vec3.cross(up,right,direction);

    }

    function initializeBuffers(gl, obj) {
        var buffers = {};

        buffers.vertex = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);


        buffers.UV = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.UV);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.uvs), gl.STATIC_DRAW);

        return buffers;
    }

    function initializeShaders(gl, program, vertexShaderCode, fragmentShaderCode) {

        var shaders = createShaders(gl, vertexShaderCode, fragmentShaderCode);

        gl.attachShader(program, shaders.vertexShader);
        gl.attachShader(program, shaders.fragmentShader);

        gl.linkProgram(program);
        gl.useProgram(program);

        program.position = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(program.position);

        program.textureCoord = gl.getAttribLocation(program, 'aTextureCoord');
        gl.enableVertexAttribArray(program.textureCoord);
    }
});
