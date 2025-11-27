// GOLDRAHMEN FÜR ILLUSTRATOR (JSX)
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var layer = doc.layers.add();
    layer.name = "GoldFrame";
    
    // Rechteck erstellen
    var frame = layer.pathItems.rectangle(700, 700, 500, 500); // Position, Größe
    frame.stroked = true;
    frame.filled = false;
    frame.strokeWidth = 5;
    
    // Goldverlauf (wie oben) erstellen oder wiederverwenden
    var goldGradient;
    // ... (Code zum Erstellen des gleichen Gradienten wie oben) ...
    
    // Verlauf auf Kontur anwenden
    frame.strokeColor = goldGradient;
    
    // 3D-Effekt
    var threeDEffect = frame.effects.add(1028); // Extrudieren
    threeDEffect.properties = { depth: 2, bevelType: 1 };
    
    // Lichtreflexe
    var highlight = layer.pathItems.ellipse(750, 750, 20, 20);
    highlight.fillColor = createRGB(255,255,255);
    highlight.opacity = 60;
    highlight.blendingMode = BlendMode.OVERLAY;
    
    alert("Goldrahmen erfolgreich erstellt!");
}
