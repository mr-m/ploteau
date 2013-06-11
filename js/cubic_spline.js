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
