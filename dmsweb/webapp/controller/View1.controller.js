sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "./DMS",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, DMS) {
        "use strict";

        return Controller.extend("dmsweb.controller.View1", {
            onInit: function () {
                let oModel = new JSONModel({
                    download: "",
                    fileinfo : {
                        filename: "",
                        filetype: "",
                        content: null,
                        attachId: "",
                        orgFileName: "test.jpg"
                    },
                    filelist: []
                });
    
                this.getView().setModel(oModel);
            },

            handleValueChange: function(oEvent) {
                let ofiles = oEvent.getParameter("files");
                console.log("File Length is {}", ofiles.length);
                console.log("File Name is {}", ofiles[0]);

                let oModel = this.getView().getModel();
                oModel.setProperty("/fileinfo/filename", ofiles[0].name);
                oModel.setProperty("/fileinfo/filetype", ofiles[0].type);
                oModel.setProperty("/fileinfo/content", ofiles[0]);
            },

            pressUpload: async function(oEvent) {
                let oModel = this.getView().getModel();

                let attachid = await DMS.fileUpload(
                    "FamilyEvent",
                    oModel.getProperty("/fileinfo/filename"),
                    oModel.getProperty("/fileinfo/content")
                );

                console.log(`Attach Id is ${attachid}`)
            },

            pressDownload: async function(oEvent) {
                let oModel = this.getView().getModel();

                await DMS.fileDownload(
                    "FamilyEvent",
                    "sap.jpg",
                    oModel.getProperty("/fileinfo/orgFileName")
                );
            },

            pressGetDirectory: function(oEvent) {
                this.getBearerToken()
            },

            pressGetDirectory2: function(oEvent) {
                this.getOauth2()
            },

            getBearerToken: async function() { 
            
                try {
                    const tokenResponse = await $.ajax({
                        method: 'GET',
                        url: '/dmstoken/oauth/token?grant_type=client_credentials',
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
            
                    console.log("Token is {}", tokenResponse.access_token); 
    
                    const data = await $.ajax({
                        method: 'POST',
                        url: '/dmsnoauth/browser/22225428-8e67-4717-a81a-009085f11673/root/FamilyEvent',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",                            
                            'Authorization': `Bearer ${tokenResponse.access_token}`
                        }
                    });
    
                    console.log(data);
    
                } catch (error) {
                    console.error(error);
                }
            },

            getOauth2 : async function(){
                let oModel = this.getView().getModel();
                oModel.setProperty("/filelist", []);
                const filelist = await $.ajax({
                    method: 'GET',
                    // url: '/dmsoauth2/browser/22225428-8e67-4717-a81a-009085f11673/root/FamilyEvent', 
                    url: '/dmsoauth2/root/FamilyEvent'
                });

                if(filelist && filelist.objects && filelist.objects.length > 0) {
                    let vList = [];
                    for(let i=0; i<filelist.objects.length; i++) {
                        let oneFile = {};
                        oneFile.filename = filelist.objects[i].object.properties['cmis:name'].value;
                        vList.push(oneFile);
                    }
                    oModel.setProperty("/filelist", vList);
                }
            },

            pressDownloadFile: function(oEvent) {
                let oModel = this.getView().getModel();
                oModel.setProperty("/download", "<a href='/dmsoauth2/root/FamilyEvent/sap.jpg' download='test.jpg'>test.jpg</a>")
            }
        });
    });
