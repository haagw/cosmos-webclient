/**
 *  Copyright © Canon Europe N.V. 2008-2018 All Rights Reserved.
 *  Internet : http://www.canon.com
 */
sap.ui.define([
	
	
], function (){
	"use strict";
	
	/**
	 * @class Holds all constants used by the app
	 * @author Wolfgang Haag
	 * @public
	 * @name com.canon.cosmos.webclient.utils.Constants
	 */
	return{
		
		//Constants for oAuth2
		CLIENT_ID : "cosmos-webclient",
		CLIENT_SECRET : "cosmospw",
		GRANT_TYPE:{PASSWORD: "password", REFRESH_TOKEN: "refresh_token"},
		STORAGE_BEARER: "bearer"
	};
});