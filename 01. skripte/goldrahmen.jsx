// AUTOMATISCHER GOLDRAHMEN FÜR AUSGEWÄHLTE OBJEKTE (KORRIGIERT)
if (app.documents.length > 0) {
    try {
        var doc = app.activeDocument;
        
        // 1. ÜBERPRÜFUNG DER AUSWAHL MIT FEHLERBEHANDLUNG
        if (!doc.selection || doc.selection.length === 0) {
            throw new Error("Bitte wählen Sie zuerst ein Objekt aus");
        }
        
        var selection = doc.selection[0];
        
        // 2. SICHERE ABMESSUNGSBERECHNUNG
        if (!selection.geometricBounds || selection.geometricBounds.length !== 4) {
            throw new Error("Ausgewähltes Objekt hat keine gültigen Abmessungen");
        }
        
        var bounds = selection.geometricBounds; // [left, top, right, bottom]
        var width = bounds[2] - bounds[0];
        var height = bounds[1] - bounds[3];
        
        // 3. RAHMENERSTELLUNG MIT VALIDIERUNG
        if (width <= 0 || height <= 0) {
            throw new Error("Ungültige Objektgröße");
        }
        
        var padding = Math.max(width, height) * 0.1;
        var frame = doc.pathItems.rectangle(
            bounds[1] + padding,  // top
            bounds[0] - padding,  // left
            width + padding * 2,  // width
            height + padding * 2  // height
        );
        
        // 4. DESIGN-FUNKTIONEN
        applyGoldGradient(frame);
        
        frame.stroked = true;
        frame.filled = false;
        frame.strokeWidth = 15;
        frame.opacity = 90;
        frame.blendingMode = "multiply";
        frame.sendBackward();
        
        alert("Goldrahmen erfolgreich erstellt!\n" +
              "Größe: " + width.toFixed(1) + " x " + height.toFixed(1) + " Punkte");
              
    } catch(e) {
        alert("Fehler: " + e.message);
    }
} else {
    alert("Kein Dokument geöffnet");
}

// GOLD-GRADIENT FUNKTION (UNVERÄNDERT)
function applyGoldGradient(item) {
    try {
        var gradient = app.activeDocument.gradients.add();
        gradient.name = "Custom_Gold_" + Date.now();
        gradient.type = "linear";
        
        while(gradient.gradientStops.length > 0) {
            gradient.gradientStops[0].remove();
        }
        
        var stops = [
            {position: 0,   color: {r:255, g:236, b:179}},
            {position: 50,  color: {r:255, g:215, b:0}},
            {position: 100, color: {r:184, g:134, b:11}}
        ];
        
        for (var i = 0; i < stops.length; i++) {
            var stop = gradient.gradientStops.add();
            stop.rampPoint = stops[i].position;
            stop.color = createRGB(stops[i].color);
        }
        
        item.strokeColor = gradient;
    } catch(e) {
        item.strokeColor = createRGB({r:255, g:215, b:0});
    }
}

// RGB HELFERFUNKTION (UNVERÄNDERT)
function createRGB(color) {
    var rgb = new RGBColor();
    rgb.red = color.r;
    rgb.green = color.g;
    rgb.blue = color.b;
    return rgb;
}