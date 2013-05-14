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
