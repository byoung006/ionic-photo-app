import {Injectable} from '@angular/core';
import {CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory, Plugins} from '@capacitor/core';


const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
public photos: Photo[] = [];
private PHOTO_STORAGE: string = "photos"

  private async savePicture(cameraPhoto: CameraPhoto){
//convert photo to base64 format so filesystem can save
    const base64Data = await this.readAsBase64 (cameraPhoto);
    //Write the file to the data directory
    const fileName = new Date().getTime() + ".jpeg";
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    //Use webPath to display the new image instead of the base64 because its already loaded into the memory
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    this.photos.unshift({
      filepath:'soon..',
      webviewPath:capturedPhoto.webPath
    })

      // Save the picture and add it to photo collection
      const savedImageFile = await this.savePicture(capturedPhoto);
      this.photos.unshift(savedImageFile);
      Storage.set({
        key: this.PHOTO_STORAGE,
        value:JSON.stringify(this.photos)
      })
    }
    public async loadSaved() {
  const photoList = await Storage.get({key:this.PHOTO_STORAGE});
  this.photos = JSON.parse(photoList.value) || [];
    }

private async readAsBase64(cameraPhoto: CameraPhoto) {
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
}
convertBlobToBase64 = (blob: Blob) =>new Promise((resolve, reject) =>{
  const reader = new FileReader;
  reader.onerror = reject;
  reader.onload = () => {
    resolve(reader.result);
  };
  reader.readAsDataURL(blob);
})


}
export interface Photo {
  filepath: string;
  webviewPath: string;
}
