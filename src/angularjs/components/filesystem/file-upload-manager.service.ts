import notificationService, {ProgressNotification} from "../notification-area/notifications.service"

export interface UploadingFile {
  file: Dropzone.DropzoneFile
  notification: ProgressNotification
}

export class FileUploadManager {
    private files = [] as UploadingFile[]
    notificationOf(file: Dropzone.DropzoneFile){
      for(const fileUpload of this.files){
        if(fileUpload.file === file) return [fileUpload.notification];
      }
      return [];
    }
    
    pushFile(file: Dropzone.DropzoneFile){
      const progressNotification = {type:"info", msg: 'Uploading ' + file.name} as ProgressNotification
      notificationService.pushNotification(progressNotification)
      this.files.push({
            file, 
            notification: progressNotification
        })
    }

    pullFile(file: Dropzone.DropzoneFile){
      this.files = this.files.reduce((result, fileUpload) => {
        if(fileUpload.file !== file){ result.push(fileUpload); }
        return result;
      }, [])
    }
}