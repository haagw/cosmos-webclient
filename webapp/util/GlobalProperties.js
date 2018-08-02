/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel"
	
], function (JSONModel){
	"use strict";
	
	/**
	 * @class Holds global properties set at runtime
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.utils.GlobalProperties
	 */
	return {
		
		_oDataSource : new JSONModel(),
		
		/** 
		 * Gets the cosmos web api datasource defined in the manifest
		 * @returns {sap.ui.model.JSONModel} The datasource model
		 * @public
		 */
		getWebApiDataSource: function(){
			return this._oDataSource;
		},
		
		/** 
		 * Sets the data source defined in the manifest
		 * @param {object} oDataSource object
		 * @public
		 */
		setWebApiDataSource: function(oDataSource){
			this._oDataSource.setData(oDataSource);
		}
		
		
	};
});