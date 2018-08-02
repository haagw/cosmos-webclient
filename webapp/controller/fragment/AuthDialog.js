sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/ValueState",
	"com/canon/cosmos/webclient/util/FormsValidator",
	"com/canon/cosmos/webclient/service/OAuthService",
	"com/canon/cosmos/webclient/formatter/i18nTranslater"
], function(ManagedObject, JSONModel, BindingMode, ValueState, FormsValidator, OAuthService, i18nTranslater){
	
	var oDialog;
	
	return ManagedObject.extend("com.canon.cosmos.webclient.controller.AuthDialog", {
		
		constructor: function(username) {
			this.username = username;
		},
		
		init: function(){
			
		},
		
		open: function(callback) {
			
			
			var oFragmentController = {
				onCloseButtonPressed: function() {
					$.sap.log.info("****************************************");
					//this.close();
					//delete this;
				},
				onLoginButtonPressed: function(event){
					if(	oDialog.getModel("input").getData().PasswordValue.length === 0 ||
						oDialog.getModel("input").getData().UserValue.length === 0 ){
					
						oDialog.getModel("input").getData().ErrorVisible = true;	
						oDialog.getModel("input").getData().ErrorText = "Bla";	
						oDialog.getModel("input").setData(oDialog.getModel("input").getData());
					}
				
					
				}
			};
			
			oDialog= sap.ui.xmlfragment("com.canon.cosmos.webclient.view..fragment.AuthDialog", oFragmentController);
			oDialog.setModel(sap.ui.getCore().getModel("i18n"), "i18n");
			this.oModel = new JSONModel();
			this.oModel.setData({
				UserValue: "",
				PasswordValue: "",
				UserValueEditable: true,
				ErrorVisible: false,
				ErrorText: ""
			});
			
			oDialog.setModel(this.oModel, "input");
			
			if(this.username !== undefined){
				oDialog.getModel("input").getData().UserValue = this.username;
				oDialog.getModel("input").getData().UserValueEditable = false;
				oDialog.getModel("input").setData(oDialog.getModel("input").getData());
			}
			


			oDialog.open();
		},
		
		onCloseButtonPressed : function(){
			
		}
		
		
	});
});