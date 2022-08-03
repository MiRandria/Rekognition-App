import React, { useState } from 'react';
import * as AWS from 'aws-sdk';
import {ImageBlob } from 'aws-sdk/clients/rekognition';
import './Upload.module.css';


export default function Upload() {
  const [image, setImage] = useState<any>();
  const [result, setResult] = useState<any>(null);
     /* document.getElementById("fileToUpload").addEventListener("change", function (event) {
        ProcessImage();
      }, false);*/
      
      //Calls DetectFaces API and shows estimated ages of detected faces
      function DetectFaces(imageData: Blob | ArrayBuffer) {
        console.log(imageData)
        AWS.config.region = "eu-west-2";
        var rekognition = new AWS.Rekognition();
        var params = {
          Image: {
            Bytes: imageData as ImageBlob
          },
          Attributes: [
            'ALL',
          ]
        };
        rekognition.detectFaces(params, function (err, data) {
          if(err) console.log(err)
          else {
            console.log(data.FaceDetails![0])
            setResult(Object.entries(data.FaceDetails![0]));
          }
        });
      }
      //Loads selected image and unencodes image bytes for Rekognition DetectFaces API
      function ProcessImage(e: React.ChangeEvent<HTMLInputElement>) {
        AnonLog();
        //var control = document.getElementById("fileToUpload") ;
        var file = e.target.files![0];
        setImage(URL.createObjectURL(file))
    
        // Load base64 encoded image 
        var reader = new FileReader();
        reader.onload = (function (theFile) {
          return function (e: any) {
            var img = document.createElement('img');
            var image = null;
            img.src = e.target?.result;
            var jpg = true;
            try {
              image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);
    
            } catch (e) {
              jpg = false;
            }
            if (jpg === false) {
              try {
                image = atob(e.target.result.split("data:image/png;base64,")[1]);
              } catch (e) {
                alert("Not an image file Rekognition can process");
                return;
              }
            }
            if (!image) {
              return;
            }
            //unencode image bytes for Rekognition DetectFaces API 
            var length = image.length;
            var imageBytes = new ArrayBuffer(length);
            var ua = new Uint8Array(imageBytes);
            for (var i = 0; i < length; i++) {
              ua[i] = image?.charCodeAt(i);
            }
            //Call Rekognition  
            DetectFaces(imageBytes);
          };
        })(file);
        reader.readAsDataURL(file);
      }

      function AnonLog() {
        // Configure the credentials provider to use your identity pool
        AWS.config.region = "eu-west-2" ; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: "eu-west-2:371cdf1c-657e-4e3f-a6a0-3cdcf905bfdc",
        });
      }
      
    
    return(
        <>
        <div className='body'>
          <h1>Facial recognition</h1> 
            <th>
              <td>
                <div>
                  <label> 
                    <h2>Select image :</h2> 
                    <input className='inputStyle' type="file"  name="fileToUpload" id="fileToUpload" accept="image/*" 
                    onChange={(e) =>
                    ProcessImage(e)
                    }/>
                  </label>
                </div>
                <div id='img'>
                  <img src={image} className='imageStyle' alt=''/>
                </div>
              </td>
              <div> 
              <tr>
              {
                (result || [] ).map(function (k: string) { 
                  return (
                    <>
                      <p>{k[0]}</p>
                      
                      {
                        (Object.entries(k[1]) || []).map(function (e:string[]) {
                          console.log(e);
                          return (
                           <>
                              {
                                typeof e[1] != 'object' ?  
                                <p>  {`${e[0]} : ${e[1]}`} </p>
                                :(Object.entries(e[1]).map(elt => <p> {elt[0] + ": " + elt[1]} </p>))
                              }
                           </>
                          );
                          
                        })
                      }
                    </>
                  )
                })
              }
              <p id="opResult" ></p>
              </tr>
              
            </div>
            </th>
         
        </div> 
        </>
    );
}
