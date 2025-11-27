// Illustrator 2025 ExtendScript: Professioneller Template-Generator mit Auswahl-Dialog
// Kategorien und Maße
var kategorien = [
  {name: "Zitatkachel_Gross", width: 1080, height: 1080},
  {name: "Zitatkachel_Mittel", width: 800, height: 800},
  {name: "Zitatkachel_Klein", width: 600, height: 600},
  {name: "Bauchbinde_Standard", width: 1920, height: 400},
  {name: "Bauchbinde_Kompakt", width: 1920, height: 300},
  {name: "Bauchbinde_Breit", width: 1920, height: 500},
  {name: "Bauchbinde_Asymmetrisch", width: 1920, height: 450},
  {name: "Bauchbinde_Minimal", width: 1920, height: 250},
  {name: "Bauchbinde_RotSchwarz", width: 1920, height: 400},
  {name: "Bauchbinde_Schmal_Logo", width: 1920, height: 200},
  {name: "Bauchbinde_PolitikReloaded", width: 1920, height: 350},
  {name: "Datenbox_Standard", width: 800, height: 600},
  {name: "Datenbox_Kompakt", width: 600, height: 400},
  {name: "Datenbox_Breit", width: 1000, height: 500},
  {name: "Datenbox_Hoch", width: 500, height: 800},
  {name: "Warnhinweis_GelbSchwarz", width: 1200, height: 200},
  {name: "Kapiteloverlay", width: 1920, height: 200},
  {name: "Hinweis_Standard", width: 1200, height: 200},
  {name: "Hinweis_Kompakt", width: 800, height: 150}
];

// Parteifarben
var parteien = [
  {name: "SPD", color: [220,0,0]},
  {name: "Grüne", color: [0,150,70]},
  {name: "CDU", color: [0,0,0]},
  {name: "Linke", color: [255,102,0]},
  {name: "AfD", color: [0,102,204]},
  {name: "FDP", color: [255,210,0]}
];

// Kanalfarben für Mischung
var kanalfarben = [
  {name: "Babyblau", color: [137,207,240]},
  {name: "Kupfer", color: [184,115,51]},
  {name: "Leuchtgrün", color: [102,255,102]},
  {name: "Silber", color: [192,192,192]}
];

// Zusammenführen für Farbauswahl
var farben = parteien.concat([{name: "Kanalfarben-Mischung", color: [0,0,0]}]); // Platzhalter

// Kategorie-Auswahl
var katIndex = prompt("Kategorie wählen:\n0=Zitatkachel_Gross\n1=Zitatkachel_Mittel\n2=Zitatkachel_Klein\n3=Bauchbinde_Standard\n4=Bauchbinde_Kompakt\n5=Bauchbinde_Breit\n6=Bauchbinde_Asymmetrisch\n7=Bauchbinde_Minimal\n8=Bauchbinde_RotSchwarz\n9=Bauchbinde_Schmal_Logo\n10=Bauchbinde_PolitikReloaded\n11=Datenbox_Standard\n12=Datenbox_Kompakt\n13=Datenbox_Breit\n14=Datenbox_Hoch\n15=Warnhinweis_GelbSchwarz\n16=Kapiteloverlay\n17=Hinweis_Standard\n18=Hinweis_Kompakt", "0");
if(katIndex===null){alert("Abgebrochen.");exit();}
katIndex = parseInt(katIndex,10);
if(isNaN(katIndex)||katIndex<0||katIndex>=kategorien.length){alert("Ungültige Auswahl.");exit();}
var kategorie = kategorien[katIndex];

// Farb-Auswahl (bei speziellen Designs eingeschränkt)
var farbIndex;
if(kategorie.name === "Bauchbinde_RotSchwarz") {
  farbIndex = 0; // SPD (Rot)
} else if(kategorie.name === "Warnhinweis_GelbSchwarz") {
  farbIndex = 6; // Kanalfarben-Mischung
} else {
  farbIndex = prompt("Farbe wählen (0=SPD, 1=Grüne, 2=CDU, 3=Linke, 4=AfD, 5=FDP, 6=Kanalfarben-Mischung):", "0");
  if(farbIndex===null){alert("Abgebrochen.");exit();}
  farbIndex = parseInt(farbIndex,10);
  if(isNaN(farbIndex)||farbIndex<0||farbIndex>=farben.length){alert("Ungültige Auswahl.");exit();}
}
var farbe = farben[farbIndex];

// Dokument anlegen
var doc = app.documents.add(DocumentColorSpace.RGB, kategorie.width, kategorie.height);
doc.name = kategorie.name+"_"+farbe.name;

// Hintergrund mit subtilem Gradient
var bgLayer = doc.layers.add();
bgLayer.name = "Background";
var bgRect = doc.pathItems.rectangle(kategorie.height, 0, kategorie.width, kategorie.height);
bgRect.filled = true;

// Hintergrund-Gradient
var bgGradient = doc.gradients.add();
bgGradient.type = GradientType.LINEAR;
bgGradient.gradientStops[0].color = new RGBColor(245,245,245);
bgGradient.gradientStops[1].color = new RGBColor(255,255,255);
bgRect.fillColor = bgGradient;
bgRect.stroked = false;
bgRect.move(bgLayer, ElementPlacement.PLACEATBEGINNING);

// Spezielle Designs
if(kategorie.name === "Warnhinweis_GelbSchwarz") {
  // Warnhinweis Design: Gelb in der Mitte, schwarze Balken außen
  var warnLayer = doc.layers.add();
  warnLayer.name = "Warnhinweis";
  
  // Schwarzer Balken links
  var leftBar = doc.pathItems.rectangle(kategorie.height, 0, kategorie.width*0.15, kategorie.height);
  leftBar.filled = true;
  leftBar.fillColor = new RGBColor(0,0,0);
  leftBar.stroked = false;
  leftBar.move(warnLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Schwarzer Balken rechts
  var rightBar = doc.pathItems.rectangle(kategorie.height, kategorie.width*0.85, kategorie.width*0.15, kategorie.height);
  rightBar.filled = true;
  rightBar.fillColor = new RGBColor(0,0,0);
  rightBar.stroked = false;
  rightBar.move(warnLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Gelbe Mitte
  var centerPlate = doc.pathItems.roundedRectangle(kategorie.height*0.2, kategorie.width*0.2, kategorie.width*0.6, kategorie.height*0.6, 20, 20);
  centerPlate.filled = true;
  centerPlate.fillColor = new RGBColor(255,255,0);
  centerPlate.stroked = true;
  centerPlate.strokeColor = new RGBColor(0,0,0);
  centerPlate.strokeWidth = 3;
  centerPlate.move(warnLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Text für Warnhinweis
  var textLayer = doc.layers.add();
  textLayer.name = "Text Placeholder";
  var textFrame = doc.textFrames.add();
  textFrame.contents = "KLÄRUNG...";
  textFrame.top = kategorie.height*0.6;
  textFrame.left = kategorie.width*0.25;
  textFrame.textRange.characterAttributes.size = 48;
  textFrame.textRange.characterAttributes.fillColor = new RGBColor(0,0,0);
  textFrame.textRange.characterAttributes.strokeColor = new RGBColor(255,255,255);
  textFrame.textRange.characterAttributes.strokeWidth = 2;
  textFrame.move(textLayer, ElementPlacement.PLACEATBEGINNING);
  
  alert("Warnhinweis 'KLÄRUNG...' wurde erstellt!");
  exit();
}

if(kategorie.name === "Bauchbinde_RotSchwarz") {
  // Rot-Schwarz Design
  var designLayer = doc.layers.add();
  designLayer.name = "RotSchwarz Design";
  
  // Schwarzer Hintergrund
  var blackBg = doc.pathItems.rectangle(kategorie.height, 0, kategorie.width, kategorie.height);
  blackBg.filled = true;
  blackBg.fillColor = new RGBColor(0,0,0);
  blackBg.stroked = false;
  blackBg.move(designLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Rote Plate
  var redPlate = doc.pathItems.roundedRectangle(kategorie.height*0.2, kategorie.width*0.1, kategorie.width*0.8, kategorie.height*0.6, 15, 15);
  redPlate.filled = true;
  redPlate.fillColor = new RGBColor(220,0,0);
  redPlate.stroked = false;
  redPlate.move(designLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Text
  var textLayer = doc.layers.add();
  textLayer.name = "Text Placeholder";
  var textFrame = doc.textFrames.add();
  textFrame.contents = "Text hier einfügen";
  textFrame.top = kategorie.height*0.5;
  textFrame.left = kategorie.width*0.15;
  textFrame.textRange.characterAttributes.size = 48;
  textFrame.textRange.characterAttributes.fillColor = new RGBColor(255,255,255);
  textFrame.textRange.characterAttributes.strokeColor = new RGBColor(0,0,0);
  textFrame.textRange.characterAttributes.strokeWidth = 1;
  textFrame.move(textLayer, ElementPlacement.PLACEATBEGINNING);
  
  alert("Rot-Schwarz Bauchbinde wurde erstellt!");
  exit();
}

if(kategorie.name === "Bauchbinde_Schmal_Logo") {
  // Schmale Bauchbinde mit Logo
  var logoLayer = doc.layers.add();
  logoLayer.name = "Logo Design";
  
  // Plate
  var plate = doc.pathItems.roundedRectangle(kategorie.height*0.3, kategorie.width*0.05, kategorie.width*0.9, kategorie.height*0.4, 10, 10);
  plate.filled = true;
  plate.fillColor = new RGBColor(50,50,50);
  plate.stroked = false;
  plate.move(logoLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Logo Platzhalter
  var logoRect = doc.pathItems.roundedRectangle(kategorie.height*0.4, kategorie.width*0.1, 80, 80, 10, 10);
  logoRect.filled = false;
  logoRect.stroked = true;
  logoRect.strokeColor = new RGBColor(255,255,255);
  logoRect.strokeWidth = 3;
  logoRect.move(logoLayer, ElementPlacement.PLACEATBEGINNING);
  
  // Text
  var textLayer = doc.layers.add();
  textLayer.name = "Text Placeholder";
  var textFrame = doc.textFrames.add();
  textFrame.contents = "Logo hier";
  textFrame.top = kategorie.height*0.6;
  textFrame.left = kategorie.width*0.12;
  textFrame.textRange.characterAttributes.size = 24;
  textFrame.textRange.characterAttributes.fillColor = new RGBColor(255,255,255);
  textFrame.move(textLayer, ElementPlacement.PLACEATBEGINNING);
  
  alert("Schmale Bauchbinde mit Logo wurde erstellt!");
  exit();
}

if(kategorie.name === "Bauchbinde_PolitikReloaded") {
  // Politik RELOADED Design
  var reloadedLayer = doc.layers.add();
  reloadedLayer.name = "Politik RELOADED";
  
  // Plate
  var plate = doc.pathItems.roundedRectangle(kategorie.height*0.2, kategorie.width*0.1, kategorie.width*0.8, kategorie.height*0.6, 20, 20);
  plate.filled = true;
  plate.fillColor = new RGBColor(30,30,30);
  plate.stroked = false;
  plate.move(reloadedLayer, ElementPlacement.PLACEATBEGINNING);
  
  // "Politik" Text
  var politikText = doc.textFrames.add();
  politikText.contents = "POLITIK";
  politikText.top = kategorie.height*0.5;
  politikText.left = kategorie.width*0.15;
  politikText.textRange.characterAttributes.size = 36;
  politikText.textRange.characterAttributes.fillColor = new RGBColor(255,255,255);
  politikText.move(reloadedLayer, ElementPlacement.PLACEATBEGINNING);
  
  // "RELOADED" Text
  var reloadedText = doc.textFrames.add();
  reloadedText.contents = "RELOADED";
  reloadedText.top = kategorie.height*0.6;
  reloadedText.left = kategorie.width*0.15;
  reloadedText.textRange.characterAttributes.size = 48;
  reloadedText.textRange.characterAttributes.fillColor = new RGBColor(255,100,0);
  reloadedText.move(reloadedLayer, ElementPlacement.PLACEATBEGINNING);
  
  alert("Politik RELOADED Bauchbinde wurde erstellt!");
  exit();
}

// Standard-Design für alle anderen Kategorien
// Schatten-Layer
var shadowLayer = doc.layers.add();
shadowLayer.name = "Shadow";
var shadowW = kategorie.width*0.8;
var shadowH = kategorie.height*0.6;
var shadowX = (kategorie.width-shadowW)/2 + 8;
var shadowY = kategorie.height-((kategorie.height-shadowH)/2) + 8;
var shadow = doc.pathItems.roundedRectangle(shadowY, shadowX, shadowW, shadowH, Math.min(shadowW,shadowH)*0.1, Math.min(shadowW,shadowH)*0.1);
shadow.filled = true;
shadow.fillColor = new RGBColor(0,0,0);
shadow.opacity = 15;
shadow.stroked = false;
shadow.move(shadowLayer, ElementPlacement.PLACEATBEGINNING);

// Haupt-Plate mit 3D-Rotation
var plateLayer = doc.layers.add();
plateLayer.name = "3D Plate";
var plateW = kategorie.width*0.8;
var plateH = kategorie.height*0.6;
var plateX = (kategorie.width-plateW)/2;
var plateY = kategorie.height-((kategorie.height-plateH)/2);

// Kategorie-spezifische Anpassungen
if(kategorie.name.indexOf("Zitatkachel") !== -1) {
  if(kategorie.name === "Zitatkachel_Gross") {
    plateW = kategorie.width*0.8;
    plateH = kategorie.height*0.8;
  } else if(kategorie.name === "Zitatkachel_Mittel") {
    plateW = kategorie.width*0.85;
    plateH = kategorie.height*0.85;
  } else if(kategorie.name === "Zitatkachel_Klein") {
    plateW = kategorie.width*0.9;
    plateH = kategorie.height*0.9;
  }
} else if(kategorie.name.indexOf("Bauchbinde") !== -1) {
  if(kategorie.name === "Bauchbinde_Standard") {
    plateW = kategorie.width*0.7;
    plateH = kategorie.height*0.7;
  } else if(kategorie.name === "Bauchbinde_Kompakt") {
    plateW = kategorie.width*0.6;
    plateH = kategorie.height*0.8;
  } else if(kategorie.name === "Bauchbinde_Breit") {
    plateW = kategorie.width*0.85;
    plateH = kategorie.height*0.65;
  } else if(kategorie.name === "Bauchbinde_Asymmetrisch") {
    plateW = kategorie.width*0.75;
    plateH = kategorie.height*0.7;
    plateX = kategorie.width*0.1;
  } else if(kategorie.name === "Bauchbinde_Minimal") {
    plateW = kategorie.width*0.5;
    plateH = kategorie.height*0.8;
  }
} else if(kategorie.name.indexOf("Datenbox") !== -1) {
  if(kategorie.name === "Datenbox_Standard") {
    plateW = kategorie.width*0.85;
    plateH = kategorie.height*0.75;
  } else if(kategorie.name === "Datenbox_Kompakt") {
    plateW = kategorie.width*0.9;
    plateH = kategorie.height*0.8;
  } else if(kategorie.name === "Datenbox_Breit") {
    plateW = kategorie.width*0.9;
    plateH = kategorie.height*0.7;
  } else if(kategorie.name === "Datenbox_Hoch") {
    plateW = kategorie.width*0.8;
    plateH = kategorie.height*0.85;
  }
}

plateX = (kategorie.width-plateW)/2;
plateY = kategorie.height-((kategorie.height-plateH)/2);

var plate = doc.pathItems.roundedRectangle(plateY, plateX, plateW, plateH, Math.min(plateW,plateH)*0.1, Math.min(plateW,plateH)*0.1);
plate.filled = true;

// Plate-Farbe je nach Auswahl
if(farbIndex < parteien.length) {
  // Parteifarbe - einfarbig mit Gradient
  var plateGradient = doc.gradients.add();
  plateGradient.type = GradientType.LINEAR;
  var baseColor = parteien[farbIndex].color;
  var lightColor = new RGBColor();
  lightColor.red = Math.min(255, baseColor[0] + 40);
  lightColor.green = Math.min(255, baseColor[1] + 40);
  lightColor.blue = Math.min(255, baseColor[2] + 40);
  var darkColor = new RGBColor();
  darkColor.red = Math.max(0, baseColor[0] - 40);
  darkColor.green = Math.max(0, baseColor[1] - 40);
  darkColor.blue = Math.max(0, baseColor[2] - 40);
  plateGradient.gradientStops[0].color = lightColor;
  plateGradient.gradientStops[1].color = darkColor;
  plate.fillColor = plateGradient;
} else {
  // Kanalfarben-Mischung - komplexer Gradient
  var plateGradient = doc.gradients.add();
  plateGradient.type = GradientType.LINEAR;
  plateGradient.gradientStops[0].color = kanalfarben[0].color; // Babyblau
  plateGradient.gradientStops[1].color = kanalfarben[1].color; // Kupfer
  plateGradient.gradientStops[2].color = kanalfarben[2].color; // Leuchtgrün
  plateGradient.gradientStops[3].color = kanalfarben[3].color; // Silber
  plate.fillColor = plateGradient;
}

plate.stroked = true;
plate.strokeColor = new RGBColor(0,0,0);
plate.strokeWidth = 2;
plate.move(plateLayer, ElementPlacement.PLACEATBEGINNING);

// 3D-Rotation für räumliche Wirkung
plate.rotate(3, true, true, true, true, Transformation.CENTER);

// Glass Shine - Hauptreflexion
var shineLayer = doc.layers.add();
shineLayer.name = "Glass Shine";
var shineW = plateW*0.7;
var shineH = plateH*0.15;
var shineX = plateX + plateW*0.15;
var shineY = plateY - plateH*0.15;
var shine = doc.pathItems.ellipse(shineY, shineX, shineW, shineH);
shine.filled = true;
var shineGradient = doc.gradients.add();
shineGradient.type = GradientType.LINEAR;
shineGradient.gradientStops[0].color = new RGBColor(255,255,255);
shineGradient.gradientStops[1].color = new RGBColor(255,255,255);
shineGradient.gradientStops[0].opacity = 60;
shineGradient.gradientStops[1].opacity = 0;
shine.fillColor = shineGradient;
shine.stroked = false;
shine.move(shineLayer, ElementPlacement.PLACEATBEGINNING);
shine.rotate(3, true, true, true, true, Transformation.CENTER);

// Zusätzliche Glass-Reflexionen
var shine2 = doc.pathItems.ellipse(shineY + shineH*0.3, shineX + shineW*0.2, shineW*0.4, shineH*0.6);
shine2.filled = true;
shine2.fillColor = shineGradient;
shine2.stroked = false;
shine2.move(shineLayer, ElementPlacement.PLACEATBEGINNING);
shine2.rotate(3, true, true, true, true, Transformation.CENTER);

// Edge Highlight
var edgeLayer = doc.layers.add();
edgeLayer.name = "Edge Highlight";
var edgeW = plateW*0.05;
var edgeH = plateH;
var edgeX = plateX + plateW*0.02;
var edgeY = plateY;
var edge = doc.pathItems.roundedRectangle(edgeY, edgeX, edgeW, edgeH, Math.min(edgeW,edgeH)*0.1, Math.min(edgeW,edgeH)*0.1);
edge.filled = true;
edge.fillColor = new RGBColor(255,255,255);
edge.opacity = 40;
edge.stroked = false;
edge.move(edgeLayer, ElementPlacement.PLACEATBEGINNING);
edge.rotate(3, true, true, true, true, Transformation.CENTER);

// Text Placeholder mit besserer Positionierung
var textLayer = doc.layers.add();
textLayer.name = "Text Placeholder";
var textFrame = doc.textFrames.add();
textFrame.contents = "Text hier einfügen";
textFrame.top = plateY - plateH*0.2;
textFrame.left = plateX + plateW*0.1;
textFrame.textRange.characterAttributes.size = Math.max(48, Math.round(plateH*0.12));
textFrame.textRange.characterAttributes.fillColor = new RGBColor(255,255,255);
textFrame.textRange.characterAttributes.strokeColor = new RGBColor(0,0,0);
textFrame.textRange.characterAttributes.strokeWidth = 1;
textFrame.move(textLayer, ElementPlacement.PLACEATBEGINNING);

// Logo Placeholder mit besserem Design
var logoLayer = doc.layers.add();
logoLayer.name = "Logo Placeholder";
var logoW = Math.min(plateW,plateH)*0.15;
var logoH = logoW;
var logoX = plateX + plateW - logoW*1.3;
var logoY = plateY - plateH + logoH*1.3;
var logoRect = doc.pathItems.roundedRectangle(logoY, logoX, logoW, logoH, logoW*0.2, logoW*0.2);
logoRect.filled = false;
logoRect.stroked = true;
logoRect.strokeColor = new RGBColor(255,255,255);
logoRect.strokeWidth = 3;
logoRect.move(logoLayer, ElementPlacement.PLACEATBEGINNING);

// Logo-Innenlinie
var logoInner = doc.pathItems.roundedRectangle(logoY + 6, logoX + 6, logoW - 12, logoH - 12, (logoW-12)*0.2, (logoW-12)*0.2);
logoInner.filled = false;
logoInner.stroked = true;
logoInner.strokeColor = new RGBColor(0,0,0);
logoInner.strokeWidth = 1;
logoInner.move(logoLayer, ElementPlacement.PLACEATBEGINNING);

alert("Professionelles Template '"+kategorie.name+"' in Farbe '"+farbe.name+"' wurde erstellt!"); 