// KAPITEL-OVERLAY FÜR ILLUSTRATOR (JSX)
if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var layer = doc.layers.add();
    layer.name = "Chapter";
    
    // Flaggenhintergrund (vereinfacht)
    var flag = layer.pathItems.rectangle(0, 0, 1000, 300);
    flag.filled = true;
    flag.fillColor = createRGB(227, 6, 19); // Rot
    
    // Schwarzer Balken
    var blackBar = layer.pathItems.rectangle(0, 100, 1000, 100);
    blackBar.filled = true;
    blackBar.fillColor = createRGB(0,0,0);
    
    // Goldbalken
    var goldBar = layer.pathItems.rectangle(0, 200, 1000, 100);
    goldBar.filled = true;
    goldBar.fillColor = createRGB(255, 215, 0); // Gold
    
    // Kapiteltext
    var chapterText = layer.textFrames.add();
    chapterText.contents = "KAPITEL 5";
    chapterText.position = [100, 250];
    chapterText.textRange.characterAttributes.size = 80;
    chapterText.textRange.characterAttributes.fillColor = createRGB(255,255,255);
    
    // Thementext
    var themeText = layer.textFrames.add();
    themeText.contents = "VERFASSUNGSREFORM";
    themeText.position = [100, 180];
    themeText.textRange.characterAttributes.size = 60;
    themeText.textRange.characterAttributes.fillColor = createRGB(255,215,0);
    
    alert("Kapitel-Overlay erstellt!");
}
