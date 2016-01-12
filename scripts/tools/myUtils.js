"use strict";

function createShaders(gl, vertexShaderCode, fragmentShaderCode) {

    var shaders = {};

    shaders.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    shaders.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shaders.vertexShader, vertexShaderCode);
    gl.shaderSource(shaders.fragmentShader, fragmentShaderCode);

    gl.compileShader(shaders.vertexShader);
    gl.compileShader(shaders.fragmentShader);

    if (!gl.getShaderParameter(shaders.vertexShader, gl.COMPILE_STATUS)) {
        alert("Vertex shader: " + gl.getShaderInfoLog(shaders.vertexShader));
        return null;
    }

    if (!gl.getShaderParameter(shaders.fragmentShader, gl.COMPILE_STATUS)) {
        alert("Fragment Shader: " + gl.getShaderInfoLog(shaders.fragmentShader));
        return null;
    }

    return shaders;
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

function loadOBJ(objfile) {

    var model = {};
    model.vertices = [];
    model.uvs = [];
    model.normals = [];

    var tmp_v = [];
    var tmp_uv = [];
    var tmp_vn = [];
    var tmp_f = [];

    var v_index = [];
    var uv_index = [];
    var vn_index = [];

    var lines = objfile.split("\n");

    for (var index = 0; index < lines.length; ++index) {

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

    for (var index = 0; index < v_index.length; ++index) {
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
