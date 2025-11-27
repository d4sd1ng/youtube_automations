// BANNER-SKRIPT MIT FEHLERBEHEBUNG (Illustrator CC+)
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    
    // 1. Schriftart-Check mit Fallback
    var targetFont = getFont("Bebas Neue") || getFont("Arial Bold") || getFirstAvailableFont();
    
    // 2. Flaggen-Hintergrund erstellen
    var flagLayer = doc.layers.add();
    flagLayer.name = "Flaggenhintergrund";
    
    var flagSize = { width: 1280, height: 720 };
    createFlag(flagLayer, flagSize.width, flagSize.height);
    
    // 3. Goldener Rahmen mit Gradient
    var frame = flagLayer.pathItems.rectangle(
        50, 
        50, 
        flagSize.width - 100, 
        flagSize.height - 100
    );
    frame.stroked = true;
    frame.filled = false;
    frame.strokeWidth = 8;
    
    // Gradient erstellen und zuweisen
    var goldColor = createGoldColor(doc);
    frame.strokeColor = goldColor;
    
    // 4. Textzentrierung
    var textLayer = doc.layers.add();
    var text = textLayer.textFrames.pointText([0, 0]);
    text.contents = "FAKTEN STATT FIKTION";
    
    // Textformatierung
    text.textRange.characterAttributes.size = 80;
    text.textRange.characterAttributes.textFont = targetFont;
    text.textRange.paragraphAttributes.justification = Justification.CENTER;
    text.textRange.characterAttributes.fillColor = goldColor;
    text.textRange.characterAttributes.strokeColor = createRGB(0, 0, 0);
    text.textRange.characterAttributes.strokeWeight = 1.5;
    
    // Textpositionierung (nach Formatierung für korrekte Größenberechnung)
    text.position = [
        (flagSize.width - text.width) / 2,
        (flagSize.height - text.height) / 2
    ];
    
    // 5. 3D-Effekt mit Fehlerbehandlung
    try {
        var threeDEffect = text.textRange.characterAttributes.appliedEffects.add(1028); // 3D-Effekt ID
        threeDEffect.properties = { 
            depth: 2, 
            bevelType: 1, 
            lighting: { intensity: 120 } 
        };
    } catch (e) {
        applyFallbackShadow(text);
    }
    
    alert("Banner erfolgreich erstellt!");
} else {
    alert("Bitte zuerst ein Dokument öffnen!");
}

// === HILFSFUNKTIONEN ===
function createRGB(r, g, b) {
    var rgb = new RGBColor();
    rgb.red = r;
    rgb.green = g;
    rgb.blue = b;
    return rgb;
}

function createGoldColor(doc) {
    try {
        if (!doc.gradients) return createRGB(255, 215, 0); // Fallback
        
        var grad = doc.gradients.add();
        grad.name = "GoldFrameGradient";
        grad.type = GradientType.LINEAR;
        
        var stops = grad.gradientStops;
        addGradientStop(stops, 0, [255, 236, 179]);
        addGradientStop(stops, 50, [255, 215, 0]);
        addGradientStop(stops, 100, [184, 134, 11]);
        
        var gradColor = new GradientColor();
        gradColor.gradient = grad;
        gradColor.angle = 45;
        return gradColor;
    } catch (e) {
        return createRGB(255, 215, 0); // Fallback
    }
}

function addGradientStop(stops, position, color) {
    var stop = stops.add();
    stop.rampPoint = position;
    stop.color = createRGB(color[0], color[1], color[2]);
}

function createFlag(layer, width, height) {
    try {
        var stripeHeight = height / 3;
        
        // Schwarzer Streifen
        var blackStripe = layer.pathItems.rectangle(0, 0, width, stripeHeight);
        blackStripe.filled = true;
        blackStripe.fillColor = createRGB(0, 0, 0);
        
        // Roter Streifen
        var redStripe = layer.pathItems.rectangle(0, stripeHeight, width, stripeHeight);
        redStripe.filled = true;
        redStripe.fillColor = createRGB(227, 6, 19);
        
        // Goldener Streifen
        var goldStripe = layer.pathItems.rectangle(0, stripeHeight * 2, width, stripeHeight);
        goldStripe.filled = true;
        goldStripe.fillColor = createRGB(255, 215, 0);
    } catch (e) {
        alert("Fehler beim Erstellen der Flagge: " + e.message);
    }
}

function getFont(name) {
    try {
        for (var i = 0; i < textFonts.length; i++) {
            if (textFonts[i].name === name) return textFonts[i];
        }
        return null;
    } catch (e) {
        return null;
    }
}

function getFirstAvailableFont() {
    return textFonts.length > 0 ? textFonts[0] : null;
}

function applyFallbackShadow(text) {
    try {
        text.textRange.characterAttributes.shadowed = true;
        text.textRange.characterAttributes.shadowAngle = 135;
        text.textRange.characterAttributes.shadowBlur = 5;
        text.textRange.characterAttributes.shadowColor = createRGB(0, 0, 0);
        text.textRange.characterAttributes.shadowOffset = 3;
    } catch (e) {
        // Falls Schatten nicht möglich
    }
}