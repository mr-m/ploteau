function CubicSpline (nodes) {
    var self = this;

    self.Build = function (nodes) {
        var segments = self.segments = [];

        var nodes_count = nodes.length;
        var segments_count = nodes_count - 3;

        if (false) {
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
        } else {
            for (var i = 0; i < segments_count; i++) {
                var x0 = nodes[i  ].x;
                var x1 = nodes[i+1].x;
                var x2 = nodes[i+2].x;
                var x3 = nodes[i+3].x;

                var y0 = nodes[i  ].y;
                var y1 = nodes[i+1].y;
                var y2 = nodes[i+2].y;
                var y3 = nodes[i+3].y;

                var M = math.matrix([
                    [1, x0, math.pow(x0, 2), math.pow(x0, 3)],
                    [1, x1, math.pow(x1, 2), math.pow(x1, 3)],
                    [1, x2, math.pow(x2, 2), math.pow(x2, 3)],
                    [1, x3, math.pow(x3, 2), math.pow(x3, 3)]
                ]);

                var M_ = math.inv(M);

                var y = math.matrix([[y0], [y1], [y2], [y3]]);

                var a = math.multiply(M_, y);

                segments[i] = new CubicSegment();

                segments[i].a = a._data[0][0];
                segments[i].b = a._data[1][0];
                segments[i].c = a._data[2][0];
                segments[i].d = a._data[3][0];

                segments[i].x_a = x1;
                segments[i].x_b = x2;
            }
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

        if (position <= segments[0].x_a) // Если x меньше точки сетки x[0] - пользуемся первым эл-том массива
        {
            s = segments[0];
        }
        else if (position >= segments[n - 1].x_a) // Если x больше точки сетки x[n - 1] - пользуемся последним эл-том массива
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

        var a = s.a;
        var b = s.b;
        var c = s.c;
        var d = s.d;
        var x = position;

        var result = a + b*x + c*x*x + d*x*x*x;
        return result;
    }
}
