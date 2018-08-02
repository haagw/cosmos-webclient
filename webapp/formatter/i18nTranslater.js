sap.ui.define([

], function() {
	"use strict";
	return {
		
		/** 
		 * Translates a text regarding the browser language settings
		 * @param {string} sKey The key to translate
		 * @param {string} param1 The parameter replace by {0} optional
		 * @param {string} param2 The parameter replace by {1} optional
		 * @param {string} param3 The parameter replace by {2} optional
		 * @returns The translated text
		 */
		doTranslate: function(sKey, param1, param2, param3) {
		  jQuery.sap.require("jquery.sap.resources");
		  var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
		  var oBundle = jQuery.sap.resources({
			url: "i18n/i18n.properties",
			locale: sLocale
		  });
		  
		  var translatedText = oBundle.getText(sKey);
		  if (translatedText.includes("{0}")){
		  	translatedText = translatedText.replace("{0}", param1);
		  }
		  if(translatedText.includes("{1}")){
		  	translatedText = translatedText.replace("{1}", param2);
		  }
		  if(translatedText.includes("{2}")){
		  	translatedText = translatedText.replace("{2}", param2);
		  }
		  
		  return translatedText;
		}
		

		
		
	};

});