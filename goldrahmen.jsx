try {
    // 2. Premium-Goldverlauf erstellen
    var goldGradient = doc.gradients.add();
    goldGradient.name = "Premium_Gold";
    goldGradient.type = GradientType.LINEAR;
    goldGradient.angle = 135; // Lichtwinkel
    
    // Verlaufsstopps definieren
    var stops = goldGradient.gradientStops;
    
    // Stopp 1: Hellgold (#FFECB3)
    var stop1 = stops.add();
    stop1.rampPoint = 0;
    stop1.color = new RGBColor();
    stop1.color.red = 255;
    stop1.color.green = 236;
    stop1.color.blue = 179;
    
    // Stopp 2: Mittelgold (#FFD700)
    var stop2 = stops.add();
    stop2.rampPoint = 50;
    stop2.color = new RGBColor();
    stop2.color.red = 255;
    stop2.color.green = 215;
    stop2.color.blue = 0;
    
    // Stopp 3: Dunkelgold (#B8860B)
    var stop3 = stops.add();
    stop3.rampPoint = 100;
    stop3.color = new RGBColor();
    stop3.color.red = 184;
    stop3.color.green = 134;
    stop3.color.blue = 11;
    
    // 3. Verlauf auf Kontur anwenden
    frame.strokeColor = goldGradient;
    
    // 4. 3D-Effekt hinzufügen (Alternative Methode)
    var threeDEffect = frame.effects.add(1028); // 1028 = 3D-Extrudieren
    threeDEffect.properties = {
        depth: 2, 
        bevelType: 1, // Rundprofil
        surface: 0, // Kunststoffoberfläche
        lighting: {
            intensity: 120,
            rotation: 30
        }
    };
    
    // 5. Position zentrieren
    frame.left = (doc.width - frame.width) / 2;
    frame.top = (doc.height - frame.height) / 2;
    
    // 6. Erfolgsmeldung mit Details
    alert("✅ Goldener Rahmen erfolgreich erstellt!\nGröße: " + frame.width + "×" + frame.height + " px");
    
  catch(error) {
    // Ausführliche Fehlermeldung
    var errorMessage = "❌ Fehler im Skript:\n" + 
                       error.message + "\n\n" +
                       "Zeile: " + error.line + "\n" +
                       "Stelle sicher dass:\n" +
                       "- Ein Dokument geöffnet ist\n" +
                       "Keine Elemente gesperrt sind";
    alert(errorMessage);
}
