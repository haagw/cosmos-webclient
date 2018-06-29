sap.ui.define([

], function() {
	"use strict";
	return {
		
		/** 
		 * Translates a text regarding the browser language settings
		 * @param sKey
		 * @returns The translated text
		 */
		doTranslate: function(sKey, oController) {
			var resourceBundle;
			if(!oController){
				resourceBundle = this.getView().getModel("i18n").getResourceBundle();
			}else{
				resourceBundle = oController.getView().getModel("i18n").getResourceBundle();
			}
			 
			return resourceBundle.getText(sKey);
		}
	};

});