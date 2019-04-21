import { Component, OnInit, ɵConsole } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FileUploader } from "ng2-file-upload";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Info } from 'src/models/Info';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})


export class FileUploadComponent implements OnInit {

  uploadForm: FormGroup;
  info: Info[] = new Array();

  public uploader: FileUploader = new FileUploader({
    isHTML5: true
  });
  title: string = 'Angular File Upload';
  constructor(private fb: FormBuilder, private http: HttpClient) { }

  onSetPrice(id: any, value: string): void {
    /* var elemId = event.explicitOriginalTarget.id; document.getElementById(elemId).classList.remove('focused');*/
    if (!this.info.some(e => e.index === id)) {
      this.info.push(new Info(id, value, ''));
      // does not exist
    }
    else {
      this.info.forEach(e => {
        if (e.index === id) {
          e.precio = value;
        }
      })
    }
    console.log(this.info);
  }
  onSetDescription(id: any, value: any): void {
    /* var elemId = event.explicitOriginalTarget.id; document.getElementById(elemId).classList.remove('focused');*/
    if (!this.info.some(e => e.index === id)) {
      this.info.push(new Info(id, '', value));
      // does not exist
    }
    else {
      this.info.forEach(e => {
        if (e.index === id) {
          e.description = value;
        }
      })
    }
    console.log(this.info);
  }
  getItemInfoById(id: any) {
    //console.log('looking for: ',id);
    //console.log(this.info);

    return this.info.find(e => e.index.toString() === id.toString());
  }
  onRemoveItem(id: any): void {
    /* var elemId = event.explicitOriginalTarget.id; document.getElementById(elemId).classList.remove('focused');*/
    if (this.info.length != id) {
      this.info.forEach(i => {
        if (i.index >= id && i.index < this.info.length) {
          this.info[i.index - 1].precio = this.info[i.index].precio;
          this.info[i.index - 1].description = this.info[i.index].description;
        }
      });
    }
    this.info.pop();

    console.log(`the index ${id} just has been removed`);
    console.log(this.info);
  }

  isValidInfo() {
    let missingInfoTotal = 0;

    for (let i = 1; i <= this.uploader.queue.length; i++) {
      var info = this.getItemInfoById(i);
      var control = document.getElementById(i.toString());

      if (info === undefined) {
        missingInfoTotal++;
        if (control != undefined) {
          control.children[1].children[0].classList.add('pendinginfo');
        }
      } else {
        if (control != undefined) {
          if (this.isMissingInfo(info)) {
            missingInfoTotal++;
            control.children[1].children[0].classList.add('pendinginfo');
          } else {
            control.children[1].children[0].classList.add('completedinfo');
          }
        }
      }
    }
    return missingInfoTotal > 0 ? false : true;
  }

  uploadSubmit() {
    if (this.isValidInfo()) {
      for (var i = 0; i < this.uploader.queue.length; i++) {
        let fileItem = this.uploader.queue[i]._file;
        if (fileItem.size > 10000000) {
          alert("Each File should be less than 10 MB of size.");
          return;
        }
      }
      for (var j = 0; j < this.uploader.queue.length; j++) {
        let data = this.createData(j);
        this.uploadFile(data).subscribe(data => alert(data.message));
      }
      this.uploader.clearQueue();
      this.info = [];
      console.log(this.info);
    }
  }

  isMissingInfo(info: Info) {
    return info.precio === undefined || info.precio === null || info.precio.length === 0 || isNaN(Number(info.precio));
  }

  createData(index: number) {
    let data = new FormData();
    let fileItem = this.uploader.queue[index]._file;
    let currentInfo = this.getItemInfoById(index + 1);

    data.append('parentId', '2626' + '_' + Date.now().toString());
    data.append('id', (index + 1).toString());
    data.append('ownFileName', fileItem.name);
    data.append('price', currentInfo.precio);
    data.append('description', currentInfo.description);
    data.append('image', fileItem);
    //data.append('dataType', this.uploadForm.controls.type.value);
    return data;
  }

  uploadFile(data: FormData): Observable<any> {
    /*
    data.forEach((value, key) => {
      console.log("key %s: value %s", key, value);
    })
    */
    return this.http.post<any>('http://localhost:4000/images/upload', data);
  }

  ngOnInit() {
    this.uploadForm = this.fb.group({
      document: [null, null],
      type: [null, Validators.compose([Validators.required])]
    });
  }

}