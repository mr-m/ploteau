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

function CubicInterpolant () {
    var self = this;

    // Структура, описывающая сплайн на каждом сегменте сетки
    var splines = [];

    // Построение сплайна
    self.Build = function (nodes)
    {
        var n = nodes.length;

        // Инициализация массива сплайнов
        for (var i = 0; i < n; ++i) {
            splines[i] = new CubicSpline();
        }
        for (var i = 0; i < n; ++i)
        {
            splines[i].x = nodes[i].position;
            splines[i].a = nodes[i].value;
        }
        splines[0].c = splines[n - 1].c = 0.0;

        // Решение СЛАУ относительно коэффициентов сплайнов c[i] методом прогонки для трехдиагональных матриц
        // Вычисление прогоночных коэффициентов - прямой ход метода прогонки
        var alpha = new Array(n - 1);
        var beta  = new Array(n - 1);
        alpha[0] = beta[0] = 0.0;
        for (var i = 1; i < n - 1; ++i)
        {
            var hi  = nodes[i].position - nodes[i - 1].position;
            var hi1 = nodes[i + 1].position - nodes[i].position;
            var A = hi;
            var C = 2.0 * (hi + hi1);
            var B = hi1;
            var F = 6.0 * ((nodes[i + 1].value - nodes[i].value) / hi1 - (nodes[i].value - nodes[i - 1].value) / hi);
            var z = (A * alpha[i - 1] + C);
            alpha[i] = -B / z;
            beta[i] = (F - A * beta[i - 1]) / z;
        }

        // Нахождение решения - обратный ход метода прогонки
        for (var i = n - 2; i > 0; --i)
        {
            splines[i].c = alpha[i] * splines[i + 1].c + beta[i];
        }

        // По известным коэффициентам c[i] находим значения b[i] и d[i]
        for (var i = n - 1; i > 0; --i)
        {
            var hi = nodes[i].position - nodes[i - 1].position;
            splines[i].d = (splines[i].c - splines[i - 1].c) / hi;
            splines[i].b = hi * (2.0 * splines[i].c + splines[i - 1].c) / 6.0 + (nodes[i].value - nodes[i - 1].value) / hi;
        }
    }

    // Вычисление значения интерполированной функции в произвольной точке
    self.Interpolate = function (position)
    {
        if (splines == null)
        {
            return double.NaN; // Если сплайны ещё не построены - возвращаем NaN
        }

        var n = splines.length;
        var s = new CubicSpline();

        if (position <= splines[0].x) // Если x меньше точки сетки x[0] - пользуемся первым эл-тов массива
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
