/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(ManagedObject){
	
	var that = this;
	
	return ManagedObject.extend("com.oce.cosmos.controller.fragment.AboutDialog", {
		
		/** 
		 * Constructor
		 * @param {sap.ui.core.mvc.View} oParentView - The view creates the dialog
		 */
		constructor: function(oParentView) {
			that = this;
			this.oParentView = oParentView;
		},
		
		/** 
		 * Destroys the ressources when dialog closing
		 */
		exit: function() {
			//delete the reference
			delete that.oParentView;

		},
		
		/** 
		 * Opens the dialog
		 */
		open: function() {
			var oAboutDialog = this.oParentView .byId("aboutDialog");
			
			if (!oAboutDialog) {
				
				//The fragment controller
				var oFragmentController = {
					/** 
					 * Close button pressed
					 */
					onCloseButtonPressed: function() {
						that.oParentView.removeDependent(oAboutDialog);
						oAboutDialog.close();
						oAboutDialog.destroy();
						//Calls the exit method in the kife cycle
						that.destroy();
					}
				};
				// creates the dialog via fragment factory
				oAboutDialog = sap.ui.xmlfragment(this.oParentView .getId(), "com.oce.cosmos.view.fragment.AboutDialog", oFragmentController);
				// connect dialog to the root view of this component (models, lifecycle)
				this.oParentView .addDependent(oAboutDialog);
				// forward compact/cozy style into dialog
            	jQuery.sap.syncStyleClass(this.oParentView .getController().getOwnerComponent().getContentDensityClass(), this.oParentView , oAboutDialog);
				
			}
			oAboutDialog.open();
		}
		
	});
});