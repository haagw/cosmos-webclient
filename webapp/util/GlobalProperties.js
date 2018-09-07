/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	
], function (){
	"use strict";
	
	/**
	 * @class Holds global properties set at runtime
	 * @author Wolfgang Haag
	 * @public
	 * @name com.oce.cosmos.utils.GlobalProperties
	 */
	return {
		
		_webApiUri : "",
		_webAuthUri : "",
		_maxCountOfNotifications : 20,
		
		/** 
		 * Gets the cosmos web api uri
		 * @returns {String} the webapi uri
		 * @public
		 */
		getWebApiUri: function(){
			return this._webApiUri;
		},
		
		/** 
		 * Sets the webapi uri 
		 * @param {String} uri - the webapi uri
		 * @public
		 */
		setWebApiUri: function(uri){
			this._webApiUri = uri;
		},
		
		/** 
		 * Gets the cosmos web auth uri
		 * @returns {String} the web auth uri
		 * @public
		 */
		getWebAuthUri: function(){
			return this._webAuthUri;
		},
		
		/** 
		 * Sets the web auth uri 
		 * @param {String} uri - the webauth uri
		 * @public
		 */
		setWebAuthUri: function(uri){
			this._webAuthUri = uri;
		},
		
		getMaxCountOfNotifications: function(){
			return this._maxCountOfNotifications;
		},
		setMaxCountOfNotifications : function(maxCount){
			this._maxCountOfNotifications = maxCount;
		}
		
		
	};
});