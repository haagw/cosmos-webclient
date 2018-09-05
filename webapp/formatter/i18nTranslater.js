sap.ui.define([

], function() {
	"use strict";
	
	//Private scope
	var	_translate = function(translatedText, param1, param2, param3) {
		var sText = translatedText;
		if (sText.includes("{0}")) {
			sText = sText.replace("{0}", param1);
		}
		if (sText.includes("{1}")) {
			sText = sText.replace("{1}", param2);
		}
		if (sText.includes("{2}")) {
			sText = sText.replace("{2}", param2);
		}
		return sText;
	};
	
	return {
			
		/** 
		 * Translates an i18n key
		 * @param {string} sKey - the used key 
		 * @param {string}  param1 - the parameter {0} to rplace
		 * @param {string}  param2 - the parameter {1} to rplace
		 * @param {string}  param3 - the parameter {2} to rplace
		 * @returns {string} The translated i18n text
		 */
		doTranslate : function(sKey, param1, param2, param3){
			$.sap.require("jquery.sap.resources");
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var oBundle = $.sap.resources({
				url: "i18n/i18n.properties",
				locale: sLocale
			});
			return _translate(oBundle.getText(sKey), param1, param2, param3);
		},
		/** 
		 * Translates an message key
		 * @param {string} sKey - the used key 
		 * @param {string}  param1 - the parameter {0} to rplace
		 * @param {string}  param2 - the parameter {1} to rplace
		 * @param {string}  param3 - the parameter {2} to rplace
		 * @returns {string} The translated i18n text
		 */
		doTranslateMessage: function(sKey, param1, param2, param3) {
			$.sap.require("jquery.sap.resources");
			var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var oBundle = $.sap.resources({
				url: "i18n/messagebundle.properties",
				locale: sLocale
			});
			return _translate(oBundle.getText(sKey), param1, param2, param3);

		}


	};
});