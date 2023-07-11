sap.ui.define([	
    "sap/m/MessageBox"
    ], function(MessageBox) {
    "use strict";

	return {
		/**
         * OData 호출시(read, update, create) 오류가 발생 시 오류 메세지를 추출하여 오류 메세지를 출력한다.
         */
        fileUpload: async function(folderName, fileName, ofile) {
			let objectId = "";
			try {	
		
				let formData = new FormData();
				formData.append('datafile', new Blob([ofile]));
				formData.append('propertyId[0]', 'cmis:name');
				formData.append('propertyValue[0]', fileName);
				formData.append('propertyId[1]', 'cmis:objectTypeId');
				formData.append('propertyValue[1]', 'cmis:document');
				formData.append('cmisaction', 'createDocument');

				// for(let [name, value] of formData) {
				// 	console.log(`${name} = ${value}`); // key1 = value1, then key2 = value2
				// }
				
				// console.log("Form Data is ", formData);

				await $.ajax({
					method: 'POST',
					url: '/dmsoauth2/root/' + folderName,
					data: formData,
					cache: false,
					contentType: false,
					processData: false,
					success: function (data) {
						// console.log(data);
						console.log("Object Info is ", data.properties['cmis:objectId']);
						objectId = data.properties['cmis:objectId'].value;
						return objectId;
					},
					error: function (error) {
						console.log(error);
						objectId = "";
					},
				});

			} catch (error) {
				console.error(error);
			}

			return objectId;
		},

		fileDownload: async function(folderName, fileName, orgFileName) {
			const data = await $.ajax({
				method: 'GET',
				url: '/dmsoauth2/root/' + folderName + "/" + fileName,
				xhrFields: {
					responseType: "blob",
				}				
			});

			if(data) {
				const file = new Blob([data]); 
				const downloadUrl = window.URL.createObjectURL(file);

				const anchorElement = document.createElement('a');
				document.body.appendChild(anchorElement);
				anchorElement.setAttribute('download', orgFileName); 
				anchorElement.href = downloadUrl; 
				
				anchorElement.click();
				
				document.body.removeChild(anchorElement);
			}
		}
	};
});