var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.

var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";



function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// TO DO: Create the functions for each of the figures.

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
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

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        // INDICES
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.

        // INDICES
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);


        // gl.drawArrays(obj.primtype, 0, obj.nVerts);
    }
}


function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

function cos(angle){
  return Math.cos(toRadians(angle));
}

function sin(angle){
  return Math.sin(toRadians(angle));
}

allColors = [
  [1.0, 0.0, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, 0.0, 1.0],
  [1.0, 1.0, 0.0],
  [1.0, 0.0, 1.0],
  [0.0, 1.0, 1.0]
]


function getShape(verts, colors ,primtype, translation, rotationAxis ,gl){

  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);


  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];

  // Triangle has 3 points in space which have 3 points in plane x,y,z
  sides = verts.length/3/3;

  for (var i = 0; i < sides; i++) {
    colorIndex = i%colors;
    vertexColors = vertexColors.concat(
      allColors[colorIndex],
      allColors[colorIndex],
      allColors[colorIndex])
  }


  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  var indexBufer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufer);
  var indices = [];
  for (var i = 0; i < verts.length/3; i++) {
    indices.push(i)
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  var shape = {
          buffer:vertexBuffer,
          colorBuffer:colorBuffer,
          indices:indexBufer,
          vertSize:3,
          nVerts:verts.length,
          colorSize:3,
          nColors: colors,
          nIndices:indices.length,
          primtype:gl.TRIANGLES,
          modelViewMatrix: mat4.create(),
          currentTime : Date.now()
    };


    mat4.translate(shape.modelViewMatrix, shape.modelViewMatrix, translation);

    shape.update = function()
    {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

  return shape;
}

function genericShape(start_point,start_angle, finish_angle, nTrian, colors ,radius,translation, rotationAxis ,gl){
  var verts = [];

  if(nTrian == 1) verts[1] = radius/2;

  step = (finish_angle - start_angle)/nTrian

  for (var i = start_angle; i < finish_angle; i+= step) {
    verts.push(0.0,start_point,0.0);
    verts.push(cos(i)*radius, 0.0 ,sin(i)*radius);
    verts.push(cos(i+step)*radius, 0.0 ,sin(i+step)*radius);

  }

  return getShape(verts, colors ,gl.TRIANGLES, translation, rotationAxis ,gl);

}

function getPyramid(r ,gl, translation, rotationAxis) {
  var side_0 = genericShape(r*3, 0, 360, 5, 5 ,r, translation, rotationAxis, gl);
  allColors.unshift(allColors.pop())
  var side_1 = genericShape(0, 0, 360, 5, 1, r, translation, rotationAxis, gl);

  return [side_0,side_1];
}


function getOchtahedron(r ,gl, translation, rotationAxis) {
  var side_0 = genericShape(r, 0, 360, 4, 4 ,r, translation, rotationAxis, gl);
  allColors.unshift(allColors.pop(), allColors.pop())
  var side_1 = genericShape(-r, 0, 360, 4, 4 ,r, translation, rotationAxis, gl);
  side_0.dir = side_1.dir = 1;
  
  update = function()
  {
    var now = Date.now();
    var deltat = now - this.currentTime;
    this.currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
    var speed = .01
    if(this.modelViewMatrix[13] > 1.5 || this.modelViewMatrix[13] < -1.5){
      this.dir = this.dir*-1;
    }
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0,speed*this.dir,0]);
  };
  side_0.update = update;
  side_1.update = update;

  return [side_0,side_1];
}

[
  1, 0, 0,
  0, 0, 1,
  0, 0, 0,
  0, 1, 0,
  2, 0, 0,
  1]

function getScutoid(r, gl, translation, rotationAxis) {
  var hexa_verts = getScutoidVerts(r*1.5, 0, 360, 6, r);
  var penta_verts = getScutoidVerts(-r*1.5, 90, 450, 5, r);

  all_verts = hexa_verts.concat(penta_verts)

  middle = [0, 0.75/2, 0.5]
  all_verts.push(middle);

  scutoidIndices = [
    // HEXA
    0,1,2,
    0,2,3,
    0,3,4,
    0,4,5,
    0,5,6,
    0,6,1,
    // PENTA
    7,8,9,
    7,9,10,
    7,10,11,
    7,11,12,
    7,12,8,

    // Back Side
    5,6,11,
    10,11,5,
    // Left Side
    4,5,10,
    9,10,4,
    // Right Side
    1,6,12,
    11,12,6,
    // Right Front
    3,4,9,
    3,13,9,
    13,8,9,
    // Left Front
    1,2,12,
    2,13,12,
    13,8,12,
    // Main Triangle
    2,3,13
  ];

  var triangles = getScutoidTriangles(all_verts, scutoidIndices, translation, rotationAxis ,gl);

  // var scutoid = getShape(triangles, 6 ,gl.TRIANGLES, translation, rotationAxis ,gl);
  var scutoid = getShapeScutoid(triangles, 6 ,gl.TRIANGLES, translation, rotationAxis ,gl);

  return [scutoid]
}



function getScutoidTriangles(verts, indices, translation, rotationAxis ,gl){
  totalVerts = [];
  for (index of indices) {
    totalVerts = totalVerts.concat(verts[index])
  }
  return totalVerts;

}


function getScutoidVerts(start_point,start_angle, finish_angle, nTrian ,radius){

  var verts = [[0.0,start_point,0.0]];

  if(nTrian == 1) verts[1] = radius/2;

  step = (finish_angle - start_angle)/nTrian

  for (var i = start_angle; i < finish_angle; i+= step) {
    if(i > 360){
      verts.push([cos(i-360)*radius, start_point, sin(i-360)*radius]);
    }
    else{
      verts.push([cos(i)*radius, start_point, sin(i)*radius]);
    }
  }
  return verts

}


function getShapeScutoid(verts, colors ,primtype, translation, rotationAxis ,gl){

  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);


  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];

  // HEXA
  for (var i = 0; i < 6; i++) {
    vertexColors = concatColor(vertexColors,0);
  }
  // PENTA
  for (var i = 0; i < 5; i++) {
    vertexColors = concatColor(vertexColors,1);
  }
  // Back Side
  for (var i = 0; i < 2; i++) {
    vertexColors = concatColor(vertexColors,2);
  }
  // Left Side
  for (var i = 0; i < 2; i++) {
    vertexColors = concatColor(vertexColors,3);
  }
  // Right Side
  for (var i = 0; i < 2; i++) {
    vertexColors = concatColor(vertexColors,4);
  }
  // Right Front
  for (var i = 0; i < 3; i++) {
    vertexColors = concatColor(vertexColors,5);
  }
  // Left Front
  for (var i = 0; i < 3; i++) {
    vertexColors = concatColor(vertexColors,2);
  }
  // Main Triangle
  vertexColors = concatColor(vertexColors,1);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  var indexBufer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufer);
  var indices = [];
  for (var i = 0; i < verts.length/3; i++) {
    indices.push(i)
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  var shape = {
          buffer:vertexBuffer,
          colorBuffer:colorBuffer,
          indices:indexBufer,
          vertSize:3,
          nVerts:verts.length,
          colorSize:3,
          nColors: 6,
          nIndices:indices.length,
          primtype:gl.TRIANGLES,
          modelViewMatrix: mat4.create(),
          currentTime : Date.now()
    };


    mat4.translate(shape.modelViewMatrix, shape.modelViewMatrix, translation);

    shape.update = function()
    {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

  return shape;
}

function concatColor(vertexColors, index) {
  vertexColors = vertexColors.concat(
    allColors[index],
    allColors[index],
    allColors[index]
  )
  return vertexColors
}
