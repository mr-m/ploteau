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
