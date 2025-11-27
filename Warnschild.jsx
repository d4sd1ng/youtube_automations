// 3D-WARNDREIECK FÜR ILLUSTRATOR
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var layer = doc.layers.add();
    layer.name = "3D-Warnschild";
    
    // Artboard-Dimensionen
    var ab = doc.artboards[0];
    var centerX = (ab.artboardRect[0] + ab.artboardRect[2]) / 2;
    var topY = ab.artboardRect[3] - 50;

    // 1. BASISDREIECK (3D-Extrusion)
    var triangle = layer.pathItems.add();
    triangle.setEntirePath([
        [centerX, topY],          // Spitze
        [centerX-80, topY-140],   // Links
        [centerX+80, topY-140]    // Rechts
    ]);
    triangle.closed = true;
    
    // 3D-Effekte
    var effects = [
        {
            name: "3D-Extrude & Bevel",
            settings: {
                extrudeDepth: 15,          // 3D-Tiefe
                bevelType: "Classic",      // Abschrägung
                bevelHeight: 3,            // Höhe der Abschrägung
                surfaceShading: 50,        // Plastizität
                lightAngle: 135            // Lichtrichtung
            }
        },
        {
            name: "Drop Shadow",
            settings: {
                opacity: 30,               // Deckkraft
                xOffset: 5,                // X-Versatz
                yOffset: 5,                // Y-Versatz
                blur: 5                    // Weichzeichnung
            }
        }
    ];

    // Effekte anwenden
    applyEffects(triangle, effects);
    triangle.fillColor = createRGB(255, 204, 0); // Gelb
    triangle.strokeColor = createRGB(0, 0, 0);   // Schwarzer Rand
    triangle.strokeWidth = 2;

    // 2. AUSRUFEZEICHEN (mit 3D-Effekt)
    var exclMark = layer.textFrames.add();
    exclMark.contents = "!";
    exclMark.position = [centerX-15, topY-90];
    exclMark.textRange.characterAttributes = {
        size: 60,
        fillColor: createRGB(0, 0, 0),
        textFont: getFont("Arial Black")
    };
    applyEffects(exclMark, [effects[0]]); // Nur Extrusion

    // 3. BANNER (mit perspektivischer Verzerrung)
    var banner = layer.pathItems.add();
    banner.setEntirePath([
        [centerX-100, topY-180],
        [centerX+100, topY-180],
        [centerX+70, topY-230],
        [centerX-70, topY-230]
    ]);
    banner.fillColor = createRGB(227, 6, 19);
    applyEffects(banner, [
        {
            name: "Free Distort",
            settings: [[-10,0], [10,0], [5,-10], [-5,-10]] // Leichte 3D-Kippung
        }
    ]);

    // Finale Optimierungen
    app.executeMenuCommand("fitall");
    app.redraw();
}

// 3D-EFFEKT-APPLIKATION
function applyEffects(item, effects) {
    for (var i = 0; i < effects.length; i++) {
        var effect = item.effects.add();
        effect.name = effects[i].name;
        for (var prop in effects[i].settings) {
            effect[prop] = effects[i].settings[prop];
        }
    }
}

// HILFSFUNKTIONEN (wie zuvor)
function createRGB(r,g,b) { /* ... */ }
function getFont(name) { /* ... */ }