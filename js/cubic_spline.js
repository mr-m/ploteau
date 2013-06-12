function CubicSpline (nodes) {
    var self = this;

    self.Build = function (nodes) {
        self.Initialize(nodes);

        var segments = self.segments;
        var nodes_count = self.nodes_count;
        var segments_count = self.segments_count;

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

    self.Initialize = function (nodes) {
        self.nodes = nodes;

        var segments = self.segments = [];
        var nodes_count = self.nodes_count = nodes.length;
        var segments_count = self.segments_count = nodes_count - 3;
    }

    if (typeof nodes !== 'undefined')
    {
        self.Build(nodes);
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
