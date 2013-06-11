function PrintMatrix (nodes, coordinate) {
    if (typeof coordinate === 'undefined') {
        coordinate = "x";
    }

    if ((typeof nodes[0] == "object") && (nodes[0] instanceof Array)) {
        for (var i in nodes) {
            PrintMatrix(nodes[i], coordinate);
        }
    } else {
        var console_string = "|";

        for (var j = 0; j < nodes.length; j++) {
            var object = nodes[j];

            var value;
            var string;

            if (typeof object === "number") {
                value = object;
            } else {
                if (typeof object !== 'undefined') {
                    value = object[coordinate];
                } else {
                    value = NaN;
                }
            }

            if (value !== NaN) {
                string = value.round(2).toString();
            } else {
                string = "-";
            }

            var length = string.length;

            for (var k = 0; k < 8 - length; k++) {
                console_string += " ";
            }

            console_string += string + " ";
        }
        console.log(console_string);
    }
}

function CubicSegment (a, b, c, d, x) {
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

function CubicSpline (nodes) {
    var self = this;

    self.Build = function (nodes) {
        var segments = self.segments = [];

        var nodes_count = nodes.length;

        var segments_count = nodes_count - 1;

        // Инициализация массива сплайнов
        for (var i = 0; i < nodes_count; ++i)
        {
            segments[i] = new CubicSegment();
        }

        for (var i = 0; i < nodes_count; ++i)
        {
            segments[i].x = nodes[i].x;
            segments[i].a = nodes[i].y;
        }

        segments[0].c = segments[nodes_count - 1].c = 0.0;

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
            segments[i].c = alpha[i] * segments[i + 1].c + beta[i];
        }

        // По известным коэффициентам c[i] находим значения b[i] и d[i]
        for (var i = nodes_count - 1; i > 0; --i)
        {
            var hi = nodes[i].x - nodes[i - 1].x;
            segments[i].d = (segments[i].c - segments[i - 1].c) / hi;
            segments[i].b = hi * (2.0 * segments[i].c + segments[i - 1].c) / 6.0 + (nodes[i].y - nodes[i - 1].y) / hi;
        }
    }

    self.segments = [];

    if (typeof nodes !== 'undefined')
    {
        self.nodes = nodes;
        self.Build(self.nodes);
    }


    // Вычисление значения интерполированной функции в произвольной точке
    self.Interpolate = function (position) {
        var segments = self.segments;

        if (segments == null)
        {
            return double.NaN; // Если сплайны ещё не построены - возвращаем NaN
        }

        var n = segments.length;
        var s = new CubicSegment();

        if (position <= segments[0].x) // Если x меньше точки сетки x[0] - пользуемся первым эл-том массива
        {
            s = segments[1];
        }
        else if (position >= segments[n - 1].x) // Если x больше точки сетки x[n - 1] - пользуемся последним эл-том массива
        {
            s = segments[n - 1];
        }
        else // Иначе x лежит между граничными точками сетки - производим бинарный поиск нужного эл-та массива
        {
            var i = 0;
            var j = n - 1;
            while (i + 1 < j)
            {
                // Force to unsigned int32
                var k = (i + (j - i) / 2) >>> 0;
                if (position <= segments[k].x)
                {
                    j = k;
                }
                else
                {
                    i = k;
                }
            }
            s = segments[j];
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
        if (false) {
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
        } else {
            var nodes_count = p.length;
            var segments_count = nodes_count - 1;

            console.groupCollapsed("Nodes received by CubicSpline builder");
            console.log("x values of received nodes");
            PrintMatrix(p, "x");

            console.log("y values of received nodes");
            PrintMatrix(p, "y");

            console.log("z values of received nodes");
            PrintMatrix(p, "z");
            console.groupEnd();

            for (var i = 0; i < nodes_count; i++) {
                for (var j = 0; j < p[i].length; j++) {
                    p[i][j] = {x: p[i][j].x, y: p[i][j].z};
                }

                self.splines[i] = new CubicSpline(p[i]);
            }
        }
    }

    if (typeof nodes !== 'undefined') {
        self.nodes = nodes;

        self.splines = [];

        self.Build(self.nodes);
    }

    self.Interpolate = function (x, y) {
        if (false) {
            var x2 = x * x;
            var x3 = x2 * x;
            var y2 = y * y;
            var y3 = y2 * y;

            return (a00 + a01 * y + a02 * y2 + a03 * y3) +
                   (a10 + a11 * y + a12 * y2 + a13 * y3) * x +
                   (a20 + a21 * y + a22 * y2 + a23 * y3) * x2 +
                   (a30 + a31 * y + a32 * y2 + a33 * y3) * x3;
        } else {
            var ar = [];

            for (var i = 0; i < self.splines.length; i++) {
                var interpolation_result = self.splines[i].Interpolate(x);

                if (interpolation_result == NaN) {
                    break;
                }

                var x_value = self.nodes[i][0].y;
                var y_value = interpolation_result;

                ar[i] = {x: x_value, y: y_value};
            }

            var spline = new CubicSpline(ar);
            var result = spline.Interpolate(y);

            return result;
        }
    }
}
