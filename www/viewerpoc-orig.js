function searchModels(sterm) {
   // viewer.model.getPropertyDb().executeUserFunction(userFunction);
    var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction, sterm);
    thePromise.then(function (retValue) {
        console.log('retValue is: ', retValue); // prints 'retValue is: 42'
        viewer.select(retValue);
        viewer.fitToView([retValue]);
    }).catch(function (err) {
        console.log("Something didn't go right...")
        console.log(err);
    });
}

function userFunction(pdb, sterm) {
    //return 42;
    sterm = sterm.toUpperCase();
    console.log("Searching for: " + sterm)
    var attrIdMass = -1;

    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function (i, attrDef, attrRaw) {

        var name = attrDef.name;
        
        if (name === 'LcRevitData_Element:lcldrevit_parameter_LongNameOverride_PG_IFC') {
            attrIdMass = i;
            return true; // to stop iterating over the remaining attributes.
        }
    });
    var searchDone = false;
    var modelId = false;

    pdb.enumObjects(function (dbId) {

        // For each part, iterate over their properties.
        pdb.enumObjectProperties(dbId, function (attrId, valId) {

            // Only process 'Mass' property.
            // The word "Property" and "Attribute" are used interchangeably.
            if (attrId === attrIdMass) {

                var value = pdb.getAttrValue(attrId, valId);
                if (value === sterm) {
                    console.log("Found " + sterm + " at " + attrId);
                    console.log("The DB ID is: " + dbId);
                    modelId = dbId;
                    searchDone = true;
                }

                //console.log(value);
                //if (value > maxValue) {
                //    maxValue = value;
                //    maxValId = dbId;
                //}

                // Stop iterating over additional properties when "Mass" is found.
                //return true;
            }
        });

        if (searchDone) {
            return true;
        }
    });

    if (modelId) {
        return modelId;
    } else {
        return false;
    }
}

