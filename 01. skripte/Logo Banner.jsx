// KORRIGIERTES LOGO-REDESIGN (Illustrator JSX)
var doc = app.activeDocument;
var layer = doc.layers.add();
layer.name = "Logo_Redesign";

// Remove existing gradient if it exists
try {
    var oldGradient = doc.gradients.getByName("Gold_Verlauf");
    oldGradient.remove();
} catch (e) {} // Ignore if gradient doesn't exist

// Safe gradient creation
var goldGradient;
try {
    doc.gradients.getByName("Gold_Verlauf").remove();
} catch (e) {}
goldGradient = doc.gradients.add();
goldGradient.name = "Gold_Verlauf_1";
goldGradient.type = GradientType.RADIAL;

// 1. Gradienten-Füllung für den Kreis (IRIS)
var iris = layer.pathItems.ellipse(300, 300, 150, 150);

// Gradient erstellen
var goldGradient = doc.gradients.add();
goldGradient.name = "Gold_Verlauf";
goldGradient.type = GradientType.RADIAL;

// Gradient-Stops
var stops = goldGradient.gradientStops;
stops.add(0, createRGB(255, 236, 179));  // #FFECB3 (0%)
stops.add(50, createRGB(255, 215, 0));   // #FFD700 (50%)
stops.add(100, createRGB(184, 134, 11)); // #B8860B (100%)

// KORREKTUR: GradientColor-Objekt erstellen
var gradientColor = new GradientColor();
gradientColor.gradient = goldGradient;
gradientColor.origin = [0, 0];  // Startpunkt des Gradienten
gradientColor.angle = 0;        // Winkel (für radial irrelevant)

// Füllung zuweisen
iris.fillColor = gradientColor;  // Nicht direkt den Gradienten!
iris.stroked = true;
iris.strokeColor = createRGB(0, 0, 0);
iris.strokeWidth = 2;

// 2. Roter Stern (KORREKTUR: Mit pathPoints richtig aufgebaut)
var star = layer.pathItems.add();
star.stroked = false;
star.fillColor = createRGB(227, 6, 19); // #E30613 (Rot)

// Stern-Pfadpunkte korrekt hinzufügen
var points = [
    [300, 400], [320, 350], [370, 350], // Oberer Teil
    [330, 300], [350, 250],             // Rechte Spitze
    [300, 280],                         // Unten Mitte
    [250, 250], [270, 300],             // Linke Spitze
    [230, 350], [280, 350]              // Unterer Teil
];

// Pfad schließen (zum Startpunkt zurückkehren)
star.setEntirePath(points.concat([[300, 400]])); 

// 3. Text (KORREKTUR: Schriftart-Fallback)
var text = layer.textFrames.add();
text.contents = "VERFASSUNGSBLICK";
text.position = [150, 200];
text.textRange.size = 30;

// Plattformunabhängige Schriftartwahl
try {
    text.textRange.textFont = textFonts.getByName("Arial-Bold");
} catch (e) {
    text.textRange.textFont = textFonts[0]; // Fallback, falls Arial nicht existiert
}
text.textRange.fillColor = createRGB(255, 255, 255); // Weiß

// Hilfsfunktion für RGB-Farben
function createRGB(r, g, b) {
    var rgb = new RGBColor();
    rgb.red = r;
    rgb.green = g;
    rgb.blue = b;
    return rgb;
}

alert("Logo erfolgreich erstellt!");