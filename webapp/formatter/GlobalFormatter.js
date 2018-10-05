sap.ui.define([

], function() {
	"use strict";
	
	
	return {
		

		/** 
		 * Checks the permissions from the given user to attach the menues
		 * @param currentPermissions The current menu permission
		 * @returns true if allowed ele false
		 */
		hasPermission: function(currentPermissions){
			
			if(!currentPermissions){
				return true;
			}
			
			var modelPermissions = sap.ui.getCore().byId("webclient---app").getModel("userPermissions");

			if(modelPermissions === undefined || modelPermissions.length === 0){
				return false;
			}
			
			if(modelPermissions.getData().includes("PERM_ALL")){
				return true;
			}
			
			var apermissions = currentPermissions.split("|");

			var returnValue = false;
			apermissions.forEach(function (item) {
				if(modelPermissions.includes(item)){
					returnValue = true;
					return;
				}
			});

			return returnValue;
		}

		
	};

});