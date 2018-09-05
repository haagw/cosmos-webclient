sap.ui.define([
   "com.oce.cosmos/controller/BaseController",
   "sap/ui/core/routing/History"
], function (BaseController, History) {
   "use strict";
   return BaseController.extend("com.oce.cosmos.controller.NotFound", {
      onInit: function () {
      },
      getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		}
   });
});