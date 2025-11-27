// WELLEN-EFFEKT FÜR BEREITS EXISTIERENDE FLAGGE
function addWavesToFlag() {
    if (app.selection.length === 0) {
        alert("Bitte zuerst die Flagge auswählen!");
        return;
    }

    var flag = app.selection[0];
    
    // 1. Flagge in eine Gruppe umwandeln (falls nicht bereits gruppiert)
    if (!(flag instanceof GroupItem)) {
        var tempGroup = app.activeDocument.groupItems.add();
        flag.moveToBeginning(tempGroup);
        flag = tempGroup;
    }

    // 2. Verzerrungseffekt anwenden (funktionierende Methode)
    var warpEffect = flag.effects.add(
        app.constants.effectNonDestructive, // Illustrator 2023+ Methode
        "Warp",
        { 
            warpStyle: "Wave", 
            bend: 20, 
            horizontalDistortion: 0, 
            verticalDistortion: 0 
        }
    );

    // 3. Optional: Manuelles Mesh für Feinjustierung
    if (warpEffect.isValid) {
        var mesh = flag.envelopeMesh(8, 4); // 8x4 Gitter
        for (var i = 0; i < mesh.meshPoints.length; i++) {
            var point = mesh.meshPoints[i];
            // Sinus-Wellenform hinzufügen
            point.anchor = [
                point.anchor[0],
                point.anchor[1] + 15 * Math.sin(point.anchor[0] / 100)
            ];
        }
    }

    alert("Welleneffekt erfolgreich angewendet!");
}

// Skript starten
try {
    addWavesToFlag();
} catch(e) {
    alert("Fehler: " + e.message + "\n\nStellen Sie sicher:\n1. Eine Gruppe/PathItem ist ausgewählt\n2. Illustrator CC 2020+");
}