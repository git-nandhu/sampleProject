import { AfterViewInit, Component, Injectable, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { WebsocketService } from '../web-socket.service';
import { FormControl, FormGroup, RequiredValidator } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-web-socket',
  templateUrl: './web-socket.component.html',
  styleUrls: ['./web-socket.component.css']
})
export class WebSocketComponent implements OnInit{

  inputData;
  constructor(public wsService: WebsocketService) { }
  ngOnInit(): void {
  }

  checkoutForm = new FormGroup({
    'value' : new FormControl(),
    'labels' : new FormControl(''),
  });

  connectWS(){
    this.wsService.connection();
    this.wsService.dataForScale();
    // this.wsService.get();
  }
  disconnectWS(){
    this.wsService.disconnect();
  }

  onSubmit(){

    //1. dynamic static seperate.
    // 2. collect labels to array.
    // 3. check subimtted label is exists.
    // False
    // 4. static data - push
    // 5. chart
    // console.log(this.checkoutForm.value);
    var value1 = this.checkoutForm['value'].value;
    var value2 = this.checkoutForm['value'].labels;
    // console.log(+value1);
    // console.log(value2);

    this.checkoutForm.reset();

    // Dyanmic data,.
    var dynamicValue = this.wsService.data2;
    // Static data.
    var inputValue = this.wsService.data1;

    // inputValue.push({'value':+value1,'labels':value2});

    // Label collectd.
    var label = dynamicValue.map((item,index)=>{
      // console.log(item,index);
      return item['labels'];
    });
    console.log(label);
    //
    var num = inputValue.map((value,index)=>{
      // console.log(value,index);
        return value['labels'];
    });
    // Combine collected labels.
    var both = [...label,...num];

    // Check submitted data exists.
    if (both.includes(value2)) {
        alert('Already exists');
        return ;
    }

    inputValue.push({'value':+value1,'labels':value2});
    this.wsService.data1 = this.inputData = inputValue;
    this.wsService.dataForScale();
    console.log(inputValue);
  }

  onDelete(i){
    this.inputData.splice(i,1);
    this.wsService.dataForScale();
  }

}
