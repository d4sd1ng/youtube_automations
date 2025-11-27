// JAVASCRIPT FÜR AUTOMATISCHE VERZERRUNG
var item = app.activeDocument.selection[0];
var warpDesc = new ActionDescriptor();
warpDesc.putEnumerated( charIDToTypeID("Styl"), charIDToTypeID("WrSt"), charIDToTypeID("Arc") ); // Bogenstil
warpDesc.putUnitDouble( charIDToTypeID("Bend"), charIDToTypeID("#Prc"), 30 ); // 30% Biegung
warpDesc.putBoolean( charIDToTypeID("Hrzn"), true ); // Horizontale Ausrichtung
executeAction( charIDToTypeID("Warp"), warpDesc, DialogModes.NO );
