// GOLD-GLAS-TEXT FÜR ILLUSTRATOR (JSX) 
// Erstellt bearbeitbaren Goldtext mit Glaseffekt
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var layer = doc.layers.add();
    layer.name = "GoldText";
    
    // Text erstellen
    var text = layer.textFrames.add();
    text.contents = "VERFASSUNGSBLICK";
    text.position = [100, 500];
    var textRange = text.textRange;
    textRange.characterAttributes.size = 180; // Basisgröße
    textRange.characterAttributes.textFont = textFonts.getByName("Bebas Neue");
    
    // Goldverlauf erstellen
    var goldGradient = doc.gradients.add();
    goldGradient.name = "PremiumGold";
    goldGradient.type = GradientType.LINEAR;
    goldGradient.angle = 90;
    
    var stops = goldGradient.gradientStops;
    var stop1 = stops.add();
    stop1.rampPoint = 0;
    stop1.color = createRGB(255, 236, 179); // #FFECB3
    
    var stop2 = stops.add();
    stop2.rampPoint = 50;
    stop2.color = createRGB(255, 215, 0); // #FFD700
    
    var stop3 = stops.add();
    stop3.rampPoint = 100;
    stop3.color = createRGB(184, 134, 11); // #B8860B
    
    // Verlauf auf Text anwenden
    textRange.characterAttributes.fillColor = goldGradient;
    
    // 3D-Effekt hinzufügen (Extrusion)
    var threeDEffect = textRange.characterAttributes.appliedEffects.add(1028); // 1028 = Extrudieren
    threeDEffect.properties = { depth: 5, bevelType: 1 };
    
    // Glaseffekt (überlagernde Ebene)
    var glassLayer = doc.layers.add();
    glassLayer.name = "GlassEffect";
    var glassText = glassLayer.textFrames.add();
    glassText.contents = "VERFASSUNGSBLICK";
    glassText.position = text.position;
    var glassRange = glassText.textRange;
    glassRange.characterAttributes = textRange.characterAttributes;
    
    // Glas-Transparenz
    glassRange.characterAttributes.fillColor = createRGB(255,255,255); // Weiß
    glassRange.characterAttributes.opacity = 30; // 30% Deckkraft
    glassRange.characterAttributes.blendingMode = BlendMode.SOFTLIGHT;
    
    // Weichzeichnen
    var blurEffect = glassRange.characterAttributes.appliedEffects.add(21); // 21 = Gaußscher Weichzeichner
    blurEffect.properties = { radius: 5 };
    
    alert("Gold-Glas-Text erfolgreich erstellt!");
} else {
    alert("Bitte öffnen Sie ein Dokument!");
}

function createRGB(r, g, b) {
    var rgb = new RGBColor();
    rgb.red = r;
    rgb.green = g;
    rgb.blue = b;
    return rgb;
}
