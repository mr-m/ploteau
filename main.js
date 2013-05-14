var settings_panel = document.getElementById("settings");

var function_field = document.getElementById("function");

var x_lower_boundary_field = document.getElementById("x_lower_boundary");
var x_upper_boundary_field = document.getElementById("x_upper_boundary");
var y_lower_boundary_field = document.getElementById("y_lower_boundary");
var y_upper_boundary_field = document.getElementById("y_upper_boundary");

var x_node_count_field = document.getElementById("x_node_count");
var y_node_count_field = document.getElementById("y_node_count");

var meter = new FPSMeter(
    settings_panel,
    {
        theme: 'light',
        position: "relative",
        left: "0em",
        right: "0em",
        graph: 1,
        history: 20
    });

var x_lower_boundary;
var x_upper_boundary;
var y_lower_boundary;
var y_upper_boundary;

var x_node_count;
var y_node_count;

var f = function (x, y) { return x + y; }

var x_coordinates = [];
var y_coordinates = [];

var values = [];

var interpolant = new CubicInterpolant();

var get_value = function (field) {
    var field_value = field.value;
    return field_value;
}

var get_number = function (field) {
    var field_value_as_number = get_value(field).toNumber();
    return field_value_as_number;
}

var get_function = function (field) {
    console.log("'get_function' called");

    var field_value = get_value(field);
    var str = 'function f(x, y) = ' + field_value;

    console.log("string given in the field: '" + field_value + "'");
    console.log("string given to the parser: '" + str + "'");

    var parser = math.parser();

    parser.eval(str);

    console.log("'get_function' work done");

    return parser.get("f");
}

var get_boundaries = function () {
    console.log("'get_boundaries' called");

    x_lower_boundary = get_number(x_lower_boundary_field);
    x_upper_boundary = get_number(x_upper_boundary_field);
    y_lower_boundary = get_number(y_lower_boundary_field);
    y_upper_boundary = get_number(y_upper_boundary_field);

    console.log("x:[" + x_lower_boundary + ", " + x_upper_boundary + "]");
    console.log("y:[" + y_lower_boundary + ", " + y_upper_boundary + "]");

    console.log("'get_boundaries' work done");
}

var get_nodes_count = function () {
    console.log("'get_nodes_count' called");

    x_node_count = get_number(x_node_count_field);
    y_node_count = get_number(y_node_count_field);

    console.log("x: " + x_node_count);
    console.log("y: " + y_node_count);

    console.log("'get_nodes_count' work done");
}

var get_nodes = function (lower_boundary, upper_boundary, nodes_count) {
    console.log("'get_nodes' called");

    var nodes = [];

    var regions_count = nodes_count - 1;

    for (var i = 0; i <= regions_count; i++) {
        var value = lower_boundary + ((upper_boundary - lower_boundary) / regions_count) * i;
        nodes[i] = value;
    };

    // console.log(nodes);

    console.log("'get_nodes' work done");

    return nodes;
}

var get_values = function (x_nodes, y_nodes, fun) {
    console.log("'get_values' called");

    var values = [];

    for (var i = 0; i < y_nodes.length; i++) {

        var y = y_nodes[i];

        values[i] = [];

        for (var j = 0; j < x_nodes.length; j++) {
            var x = x_nodes[j];

            var z = fun(x, y);

            values[i][j] = new THREE.Vector3(x, y, z);
        }
    }

    // console.log(values);

    console.log("'get_values' work done");

    return values;
}

var get_vertices = function (nodes, markup) {
    console.log("'get_vertices' called");

    var floating = markup.floating || 'x';
    var fixed    = markup.fixed    || 'y';
    var value    = markup.value    || 'z';

    var vertices = []

    var nodes_along = nodes.flatten().sortBy(floating).groupBy(fixed);

    // console.log(nodes_along);

    for (var fixed_coordinate in nodes_along) {
        // console.log(fixed_coordinate);
        // console.log(nodes_along[fixed_coordinate]);

        var current_nodes = nodes_along[fixed_coordinate];

        interpolant.Build(current_nodes, {node: floating, value: value});

        var floating_position = current_nodes[0][floating];
        var fixed_position    = fixed_coordinate.toNumber();

        while (floating_position <= current_nodes[current_nodes.length - 1][floating]) {
            var pX = (fixed === 'x') ? fixed_position : floating_position,
                pY = (fixed === 'y') ? fixed_position : floating_position,
                pZ = interpolant.Interpolate(floating_position),
                particle = new THREE.Vector3(pX, pY, pZ);

            vertices.push(particle);

            floating_position += 0.1;
        }
    }

    console.log("'get_vertices' work done");

    return vertices;
}

var A_change = function () {
    console.log("'A_change' event appeared");

    get_boundaries();
    get_nodes_count();

    console.log("'A_change' event handler work done");
    B_change();
}

var B_change = function () {
    console.log("'B_change' event appeared");

    f = get_function(function_field);

    x_coordinates = get_nodes(x_lower_boundary, x_upper_boundary, x_node_count);
    console.log(x_coordinates);

    y_coordinates = get_nodes(y_lower_boundary, y_upper_boundary, y_node_count);
    console.log(y_coordinates);

    values = get_values(x_coordinates, y_coordinates, f);

    console.log("'B_change' event handler work done");
    C_change();
}

var C_change = function () {
    console.log("'C_change' event appeared");

    particles.dispose();

    particles = new THREE.Geometry();
    particleSystem = new THREE.ParticleSystem(particles, material);
    scene.add(particleSystem);

    console.log(particles);

    particles.vertices.add(get_vertices(values, {fixed: 'y', floating: 'x', value: 'z'}));
    particles.vertices.add(get_vertices(values, {fixed: 'x', floating: 'y', value: 'z'}));

    console.log("'C_change' event handler work done");
}

x_lower_boundary_field.addEventListener("change", A_change);
x_upper_boundary_field.addEventListener("change", A_change);
y_lower_boundary_field.addEventListener("change", A_change);
y_upper_boundary_field.addEventListener("change", A_change);

x_node_count_field.addEventListener("change", A_change);
y_node_count_field.addEventListener("change", A_change);

function_field.addEventListener("change", B_change);

var scene    = new THREE.Scene();
var camera   = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("render").appendChild(renderer.domElement);

camera.position.z = 15;

var light = new THREE.SpotLight();
light.position.set(10, 10, 10);
scene.add(light);

var axes = new THREE.AxisHelper(10);
scene.add(axes);

// create the particle variables
var particles = new THREE.Geometry();
var material = new THREE.ParticleBasicMaterial({
    color: 0xFFAAAA,
    size: 0.1,
    transparent: true
});

// create the particle system
var particleSystem = new THREE.ParticleSystem(particles, material);

particleSystem.sortParticles = true;

// add it to the scene
scene.add(particleSystem);

var down = false;
var sx = 0, sy = 0;

window.onmousedown = function (ev) {
    if (ev.target == renderer.domElement) {
        down = true;
        sx = ev.clientX;
        sy = ev.clientY;
    }
};

window.onmouseup = function () {
    down = false;
};

window.onmousemove = function (ev) {
    if (down) {
        var dx = ev.clientX - sx;
        var dy = ev.clientY - sy;

        particleSystem.rotation.z += dx * 0.01;
        axes.rotation.z += dx * 0.01;

        var new_angle = axes.rotation.x + dy * 0.01;

        if (new_angle > 0) {
            new_angle = 0;
        }

        if (new_angle < -math.pi) {
            new_angle = -math.pi;
        }

        particleSystem.rotation.x = axes.rotation.x = new_angle;

        sx += dx;
        sy += dy;
    }
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    meter.tick();
}

A_change();

render();
