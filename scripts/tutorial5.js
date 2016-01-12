"use strict";

require.config( {
    paths: {
        data: "data",
    }
} );

define(
    ["tools/glUtils",
    "tools/sylvester",
    "tools/myUtils",
    "tools/dds",
    "text!shaders/fragment5.shader",
    "text!shaders/vertex5.shader",
    "data!texture.dds",
    ],

    function (glUtils, sylvester, myUtils, dds, fragmentShader, vertexShader, textureData) {

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

        initializeShaders(gl, program, vertexShader, fragmentShader);
        var buffers = initializeBuffers(gl);

        var texture = initializeTexture(gl, textureData)

        setInterval(draw, 15);




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
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);

        //Texture Coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.UV);
        gl.vertexAttribPointer(program.textureCoord, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, texture);
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
        document.addEventListener("mousewheel", wheelInput, false);
      } else {
        document.removeEventListener("mousemove", mouseInput, false);
        document.removeEventListener("keydown", keyInput, false);
      }
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

    function wheelInput(event) {
        if (event.wheelDelta >= 120)
            FoV += 5;
        else if (event.wheelDelta <= -120)
            FoV -= 5;
        return false;
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

    function initializeTexture(gl, textureData) {
        var ext = gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        var data = uploadDDSLevels(gl, ext, textureData, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, data.mipmaps > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);

        return texture;
    }

    function initializeBuffers(gl) {
        var buffers = {};
        var vertices =
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

        buffers.vertex = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var uv =
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

        buffers.UV = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.UV);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

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
