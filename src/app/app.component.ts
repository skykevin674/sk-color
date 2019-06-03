import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  list: any[];

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {

  }

  upload = (item: any) => {
    const form = new FormData();
    form.append('file', item.file, item.file.name);
    return this.httpClient.post('http://localhost:4000/api/upload', form).subscribe((req: any) => {
      if (req.type === HttpEventType.UploadProgress) {
        console.log('pro');
      } else {
        if (req.valid) {
          this.list = req.data;
          item.onSuccess(req, item.file);
        } else {
        }
      }
    }, err => {
      item.onError(err);
    });
  }
}
