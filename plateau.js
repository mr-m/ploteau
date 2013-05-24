function Extrapolate (nodes) {
    var countY = nodes.length;
    var countX = nodes[0].length;

    var countY_extra = countY + 2;
    var countX_extra = countX + 2;

    console.log("initial nodes (y * x): " + countY + " * " + countX);
    console.log("extrapolated nodes (y * x): " + countY_extra + " * " + countX_extra);

    var input = new Array(countY_extra);

    for (var i = 0; i < countY_extra; i++) {
        input[i] = new Array(countX_extra);
    }

    for (var i = 0; i < countY; i++) {
        for (var j = 0; j < countX; j++) {
            // Copying elements
            input[i + 1][j + 1] = nodes[j][i];

            // Initializing not yet existing elements

            if (i == 0) {
                input[i][j + 1] = {x: 0, y: 0, z: 0};
            }

            if (i == (countY - 1)) {
                input[countY + 1][j + 1] = {x: 0, y: 0, z: 0};
            }

            if (j == 0) {
                input[i + 1][j] = {x: 0, y: 0, z: 0};
            }

            if (j == (countX - 1)) {
                input[i + 1][countX + 1] = {x: 0, y: 0, z: 0};
            }
        }
    }

    // Initializing elements at corners
    input[         0][         0] = {x: 0, y: 0, z: 0};
    input[         0][countX + 1] = {x: 0, y: 0, z: 0};
    input[countY + 1][         0] = {x: 0, y: 0, z: 0};
    input[countY + 1][countX + 1] = {x: 0, y: 0, z: 0};

    for (var i = 0; i < countY_extra; i++) {
        for (var j = 0; j < countX_extra; j++) {
            var v1;
            var v2;
            var vector;
            var boundary = false;

            // Extrapolating to the top
            // Extrapolating along the -Y axis
            if (i == 0) {
                v1 = input[i + 1][j];
                v2 = input[i + 2][j];

                boundary = true;
            }

            // Extrapolating to the left
            // Extrapolating along the -X axis
            if (j == 0) {
                v1 = input[i][j + 1];
                v2 = input[i][j + 2];

                boundary = true;
            }

            // Extrapolating to the right
            // Extrapolating along the X axis
            if (j == (countX_extra - 1)) {
                v1 = input[i][j - 1];
                v2 = input[i][j - 2];

                boundary = true;
            }

            // Extrapolating to the bottom
            // Extrapolating along the Y axis
            if (i == (countY_extra - 1)) {
                v1 = input[i - 1][j];
                v2 = input[i - 2][j];

                boundary = true;
            }

            if (boundary) {
                var vector = {x: 0, y: 0, z: 0};

                vector.x = v1.x + v1.x - v2.x;
                vector.y = v1.y + v1.y - v2.y;
                vector.z = v1.z - v2.z;

                input[i][j] = vector;

                boundary = false;
            }
        }
    }

    // Upper-left corner should be handled separately
    // Because it can't get it's right values in the for-loop above
    input[0][0].x = input[0][1].x + input[0][1].x - input[0][2].x;
    input[0][0].y = input[0][1].y + input[0][1].y - input[0][2].y;

    {
        var v1 = input[0][1];
        var v2 = input[1][0];

        input[0][0].z = (v1.z + v1.z) / 2;
    }

    {
        var v1 = input[0][countX_extra - 2];
        var v2 = input[1][countX_extra - 1];

        input[0][countX_extra - 1].z = (v1.z + v1.z) / 2;
    }

    {
        var v1 = input[countY_extra - 2][0];
        var v2 = input[countY_extra - 1][1];

        input[countY_extra - 1][0].z = (v1.z + v1.z) / 2;
    }

    {
        var v1 = input[countY_extra - 2][countX_extra - 1];
        var v2 = input[countY_extra - 1][countX_extra - 2];

        input[countY_extra - 1][countX_extra - 1].z = (v1.z + v1.z) / 2;
    }

    console.log(input);

    return input;
}

function CubicSpline (a, b, c, d, x) {
    if (typeof a === 'undefined') a = 0;
    if (typeof b === 'undefined') b = 0;
    if (typeof c === 'undefined') c = 0;
    if (typeof d === 'undefined') d = 0;
    if (typeof x === 'undefined') x = 0;

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.x = x;
}

function CubicInterpolant (nodes) {
    var self = this;

    self.BuildSpline = function (nodes) {
        var splines = self.splines;

        var   nodes_count = nodes.length;
        var splines_count = nodes_count - 1;

        // Инициализация массива сплайнов
        for (var i = 0; i < nodes_count; ++i)
        {
            splines[i] = new CubicSpline();
        }

        for (var i = 0; i < nodes_count; ++i)
        {
            splines[i].x = nodes[i].x;
            splines[i].a = nodes[i].y;
        }

        splines[0].c = splines[nodes_count - 1].c = 0.0;

        // Решение СЛАУ относительно коэффициентов сплайнов c[i] методом прогонки для трехдиагональных матриц
        // Вычисление прогоночных коэффициентов - прямой ход метода прогонки
        var alpha = new Array(nodes_count);
        var beta  = new Array(nodes_count);

        alpha[0] = beta[0] = 0.0;

        for (var i = 1; i < nodes_count - 1; ++i)
        {
            var hi  = nodes[i].x - nodes[i - 1].x;
            var hi1 = nodes[i + 1].x - nodes[i].x;
            var A = hi;
            var C = 2.0 * (hi + hi1);
            var B = hi1;
            var F = 6.0 * ((nodes[i + 1].y - nodes[i].y) / hi1 - (nodes[i].y - nodes[i - 1].y) / hi);
            var z = (A * alpha[i - 1] + C);
            alpha[i] = -B / z;
            beta[i] = (F - A * beta[i - 1]) / z;
        }

        // Нахождение решения - обратный ход метода прогонки
        for (var i = nodes_count - 2; i > 0; --i)
        {
            splines[i].c = alpha[i] * splines[i + 1].c + beta[i];
        }

        // По известным коэффициентам c[i] находим значения b[i] и d[i]
        for (var i = nodes_count - 1; i > 0; --i)
        {
            var hi = nodes[i].x - nodes[i - 1].x;
            splines[i].d = (splines[i].c - splines[i - 1].c) / hi;
            splines[i].b = hi * (2.0 * splines[i].c + splines[i - 1].c) / 6.0 + (nodes[i].y - nodes[i - 1].y) / hi;
        }
    }

    self.BuildDimension = function (nodes, markup) {
        var floating = markup.floating || 'x';
        var fixed    = markup.fixed    || 'y';
        var value    = markup.value    || 'z';

        var vertices = [];

        var nodes_along = nodes.flatten().sortBy(floating).groupBy(fixed);

        for (var fixed_coordinate in nodes_along) {
            var current_nodes = nodes_along[fixed_coordinate];

            var nodes_coordinates_only = current_nodes.clone();

            for (var i = 0; i < nodes_coordinates_only.length; i++) {
                var el = nodes_coordinates_only[i];

                var new_el = {x: el[floating], y: el[value]};

                nodes_coordinates_only[i] = new_el;
            }

            console.log(nodes_coordinates_only);

            self.BuildSpline(nodes_coordinates_only);

            var floating_position = current_nodes[0][floating];
            var fixed_position    = fixed_coordinate.toNumber();

            while (floating_position <= current_nodes[current_nodes.length - 1][floating]) {
                var pX = (fixed === 'x') ? fixed_position : floating_position,
                    pY = (fixed === 'y') ? fixed_position : floating_position,
                    pZ = self.Interpolate(floating_position),
                    particle = new THREE.Vector3(pX, pY, pZ);

                vertices.push(particle);

                floating_position += 0.1;
            }
        }

        console.log("'get_vertices' work done");

        return vertices;
    }

    self.Build = function (nodes) {
        var vertices = [];

        var add1 = self.BuildDimension(nodes, {fixed: 'y', floating: 'x', value: 'z'});
        var add2 = self.BuildDimension(nodes, {fixed: 'x', floating: 'y', value: 'z'});

        vertices.add(add1);
        vertices.add(add2);

        return vertices;
    }

    self.splines = [];

    self.nodes = [];

    if (typeof nodes !== 'undefined')
    {
        self.nodes = nodes;
        self.Build(self.nodes);
    }

    // Вычисление значения интерполированной функции в произвольной точке
    self.Interpolate = function (position) {
        var splines = self.splines;

        if (splines == null)
        {
            return double.NaN; // Если сплайны ещё не построены - возвращаем NaN
        }

        var n = splines.length;
        var s = new CubicSpline();

        if (position <= splines[0].x) // Если x меньше точки сетки x[0] - пользуемся первым эл-том массива
        {
            s = splines[1];
        }
        else if (position >= splines[n - 1].x) // Если x больше точки сетки x[n - 1] - пользуемся последним эл-том массива
        {
            s = splines[n - 1];
        }
        else // Иначе x лежит между граничными точками сетки - производим бинарный поиск нужного эл-та массива
        {
            var i = 0;
            var j = n - 1;
            while (i + 1 < j)
            {
                // Force to unsigned int32
                var k = (i + (j - i) / 2) >>> 0;
                if (position <= splines[k].x)
                {
                    j = k;
                }
                else
                {
                    i = k;
                }
            }
            s = splines[j];
        }

        var dx = position - s.x;
        // Вычисляем значение сплайна в заданной точке по схеме Горнера (в принципе, "умный" компилятор применил бы схему Горнера сам, но ведь не все так умны, как кажутся)
        return s.a + (s.b + (s.c / 2.0 + s.d * dx / 6.0) * dx) * dx;
    }
}

function BicubicSurface (nodes) {
    var self = this;

    var a00;
    var a01;
    var a02;
    var a03;

    var a10;
    var a11;
    var a12;
    var a13;

    var a20;
    var a21;
    var a22;
    var a23;

    var a30;
    var a31;
    var a32;
    var a33;

    self.Build = function (p) {
        a00 = p[1][1];
        a01 = -.5*p[1][0] + .5*p[1][2];
        a02 = p[1][0] - 2.5*p[1][1] + 2*p[1][2] - .5*p[1][3];
        a03 = -.5*p[1][0] + 1.5*p[1][1] - 1.5*p[1][2] + .5*p[1][3];

        a10 = -.5*p[0][1] + .5*p[2][1];
        a11 = .25*p[0][0] - .25*p[0][2] - .25*p[2][0] + .25*p[2][2];
        a12 = -.5*p[0][0] + 1.25*p[0][1] - p[0][2] + .25*p[0][3] + .5*p[2][0] - 1.25*p[2][1] + p[2][2] - .25*p[2][3];
        a13 = .25*p[0][0] - .75*p[0][1] + .75*p[0][2] - .25*p[0][3] - .25*p[2][0] + .75*p[2][1] - .75*p[2][2] + .25*p[2][3];

        a20 = p[0][1] - 2.5*p[1][1] + 2*p[2][1] - .5*p[3][1];
        a21 = -.5*p[0][0] + .5*p[0][2] + 1.25*p[1][0] - 1.25*p[1][2] - p[2][0] + p[2][2] + .25*p[3][0] - .25*p[3][2];
        a22 = p[0][0] - 2.5*p[0][1] + 2*p[0][2] - .5*p[0][3] - 2.5*p[1][0] + 6.25*p[1][1] - 5*p[1][2] + 1.25*p[1][3] + 2*p[2][0] - 5*p[2][1] + 4*p[2][2] - p[2][3] - .5*p[3][0] + 1.25*p[3][1] - p[3][2] + .25*p[3][3];
        a23 = -.5*p[0][0] + 1.5*p[0][1] - 1.5*p[0][2] + .5*p[0][3] + 1.25*p[1][0] - 3.75*p[1][1] + 3.75*p[1][2] - 1.25*p[1][3] - p[2][0] + 3*p[2][1] - 3*p[2][2] + p[2][3] + .25*p[3][0] - .75*p[3][1] + .75*p[3][2] - .25*p[3][3];

        a30 = -.5*p[0][1] + 1.5*p[1][1] - 1.5*p[2][1] + .5*p[3][1];
        a31 = .25*p[0][0] - .25*p[0][2] - .75*p[1][0] + .75*p[1][2] + .75*p[2][0] - .75*p[2][2] - .25*p[3][0] + .25*p[3][2];
        a32 = -.5*p[0][0] + 1.25*p[0][1] - p[0][2] + .25*p[0][3] + 1.5*p[1][0] - 3.75*p[1][1] + 3*p[1][2] - .75*p[1][3] - 1.5*p[2][0] + 3.75*p[2][1] - 3*p[2][2] + .75*p[2][3] + .5*p[3][0] - 1.25*p[3][1] + p[3][2] - .25*p[3][3];
        a33 = .25*p[0][0] - .75*p[0][1] + .75*p[0][2] - .25*p[0][3] - .75*p[1][0] + 2.25*p[1][1] - 2.25*p[1][2] + .75*p[1][3] + .75*p[2][0] - 2.25*p[2][1] + 2.25*p[2][2] - .75*p[2][3] - .25*p[3][0] + .75*p[3][1] - .75*p[3][2] + .25*p[3][3];
    }

    if (typeof nodes !== 'undefined') {
        self.nodes = nodes;
        self.Build(self.nodes);
    }

    self.Interpolate = function (x, y) {
        var x2 = x * x;
        var x3 = x2 * x;
        var y2 = y * y;
        var y3 = y2 * y;

        return (a00 + a01 * y + a02 * y2 + a03 * y3) +
               (a10 + a11 * y + a12 * y2 + a13 * y3) * x +
               (a20 + a21 * y + a22 * y2 + a23 * y3) * x2 +
               (a30 + a31 * y + a32 * y2 + a33 * y3) * x3;
    }
}

function BicubicInterpolant (nodes) {
    var self = this;

    self.Build = function (nodes) {
        var countY = nodes.length;
        var countX = nodes[0].length;

        var countY_extra = countY + 2;
        var countX_extra = countX + 2;

        var countY_surfaces = countY - 1;
        var countX_surfaces = countX - 1;

        console.log("surfaces (y * x): " + countY_surfaces + " * " + countX_surfaces);

        var surfaces = new Array(countY_surfaces);

        for (var i = 0; i < countY_surfaces; i++) {
            surfaces[i] = new Array(countX_surfaces);
        }

        var input = Extrapolate(nodes);

        for (var i = 0; i < countY_extra; i++) {
            for (var j = 0; j < countX_extra; j++) {
                input[i][j] = input[i][j].z;
            }
        }

        for (var i = 1; i < countY; i++) {
            for (var j = 1; j < countX; j++) {
                var points = [[],[],[],[]];

                points[0][0] = input[i - 1][j - 1];
                points[1][0] = input[i    ][j - 1];
                points[2][0] = input[i + 1][j - 1];
                points[3][0] = input[i + 2][j - 1];

                points[0][1] = input[i - 1][j];
                points[1][1] = input[i    ][j];
                points[2][1] = input[i + 1][j];
                points[3][1] = input[i + 2][j];

                points[0][2] = input[i - 1][j + 1];
                points[1][2] = input[i    ][j + 1];
                points[2][2] = input[i + 1][j + 1];
                points[3][2] = input[i + 2][j + 1];

                points[0][3] = input[i - 1][j + 2];
                points[1][3] = input[i    ][j + 2];
                points[2][3] = input[i + 1][j + 2];
                points[3][3] = input[i + 2][j + 2];

                surfaces[i - 1][j - 1] = new BicubicSurface(points);
            }
        }

        var vertices = [];
        var a = -10;
        var b =  10;
        var L = b - a;
        var l = L / countX_surfaces;

        var y = -10;
        while (y <= 10) {
            var x = -10;
            while (x <= 10) {
                var x_index = math.floor((L - (b - x)) / l);
                var y_index = math.floor((L - (b - y)) / l);

                var z = surfaces[y_index][x_index].Interpolate(x, y) / 1024 / 2;

                var particle = new THREE.Vector3(x, y, z);

                vertices.push(particle);

                x += 0.1;
            }
            y += 0.1;
        }

        return vertices;
    }

    if (typeof nodes !== 'undefined') {
        self.nodes = nodes;
        self.Build(self.nodes);
    }

    // Вычисление значения интерполированной функции в произвольной точке
    self.Interpolate = function (position) {
        self.x_a = -10;
        self.x_b =  10;

        self.y_a = -10;
        self.y_b =  10;

        self.x_L = x_b - x_a;
        self.y_L = y_b - y_a;

        self.x_l = x_L / countX_surfaces;
        self.y_l = y_L / countY_surfaces;

        var x_index = math.floor((L - (b - x)) / l);
        var y_index = math.floor((L - (b - y)) / l);

        var z = surfaces[y_index][x_index].Interpolate(x, y) / 1024 / 2;
    }
}
