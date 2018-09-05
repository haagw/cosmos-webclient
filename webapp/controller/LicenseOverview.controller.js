sap.ui.define([
		"com/oce/cosmos/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"com/oce/cosmos/service/ServerService",
		"sap/m/MessageBox",
		"sap/ui/model/Filter"
	], function (BaseController, JSONModel, ServerService, MessageBox, Filter) {
		"use strict";
		
		//Reference to the controller
		var that;
		
		return BaseController.extend("com.oce.cosmos.controller.LicenseOverview", {

			onInit: function () {
				that = this;
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

				var getLicenseInformationListCallback = {
					onSuccess: function(oEvenSuccess) {
						var model = oEvenSuccess.getSource();
						
						that.getView().setModel(model);
						
						var a = [];
						var b = [];

						var li = that.getView().getModel().getProperty("/");
						for(var i = 0; i < li.length; i++) {
						  if(a.indexOf(li[i].groupName) === -1) {
						    a.push(li[i].groupName);
						  }
						}
						for(var j = 0; j < a.length; j++) {
						  var object = {};
						  object.groupName = a[j];
						  b.push(object);
						}
						
						that.getView().getModel().setProperty("/Filter", b);
						that._oTable = that.getView().byId("tblLicenceInformation");

					}
				};
				ServerService.getInstance().getLicenseInformationList(getLicenseInformationListCallback);	
				
			},
		    onChange: function(oEvent) {
		        // getting the value of Combobox
		        //this._oTable.setShowOverlay(true);
		    },
		    onReset: function(oEvent) {
		        // resetting the value of Combobox and initial state of the table
		        var oBinding = that._oTable.getBinding("items");
		        oBinding.filter([]);
		        that._oTable.setShowOverlay(false);
		        that.getView().byId("selFilter").setSelectedItem(null);
		    },
		    onSearch: function(oEvent) {
		        var comboBoxValue = that.getView().byId("selFilter").getSelectedItem().getProperty("text"),
		            oBinding = that._oTable.getBinding("items"),
		            oFilter;
		        if (comboBoxValue || comboBoxValue === "") {
		            //that._oTable.setShowOverlay(false);
		            oFilter = new Filter("groupName", "EQ", comboBoxValue);
		            oBinding.filter([oFilter]);
		        }
		    }
		});
});