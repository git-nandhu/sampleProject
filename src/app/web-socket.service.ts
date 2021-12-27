import {Injectable, OnInit} from '@angular/core';
declare var SockJS;
declare var Stomp;
import * as d3 from 'd3';
import { ApiService } from './api.service';


@Injectable({
    providedIn:'root'
})
export class WebsocketService implements OnInit{

  topic = '/topic/greetings';
  public stompClient;
  public msg = [];
 //from websocket
  IBHIGH;
  IBLOW;
  IB;
  IB1_5UP;
  IB2UP;
  IB3UP;
  IB1_5DOWN;
  IB2DOWN;
  IB3DOWN;
  vPOC;
  vWAP;
// from Api prev day value
  pIB;
  pIBHIGH;
  pIBLOW;
  pIB1_5UP;
  pIB2UP;
  pIB3UP;
  pIB1_5DOWN;
  pIB2DOWN;
  pIB3DOWN;
//from socket
  F15MV;
  LTP;
  totalVolume
//from api
  apiGetOpenVol;
  apiGetOpenVolAvg
  apiRefData;
  apiPrevDayVpoc;
  apiPrevDayVwap;
//tpoVolumeProfile for bar chart from socket
tVolA;
tVolB;
tVolC;
tVolD;
tVolE;
tVolF;
tVolG;
tVolH;
tVolI;
tVolJ;
tVolK;
tVolL;
tVolM;
//tpoVolumeProfile for bar chart from api
pVolA;
pVolB;
pVolC;
pVolD;
pVolE;
pVolF;
pVolG;
pVolH;
pVolI;
pVolJ;
pVolK;
pVolL;
pVolM;

//data only for testing chart
  data = [];
  data1 = [];
  data2 = [];

  constructor(private apiService: ApiService) {
  }
  ngOnInit(): void {
      
  }

  connection() {
    const serverUrl = 'http://test-env.eba-kxvikfsm.us-east-2.elasticbeanstalk.com:80/tick-websocket';
    const ws = new SockJS(serverUrl);
    this.stompClient = Stomp.over(ws);
    const that = this;
    // tslint:disable-next-line:only-arrow-functions
    this.stompClient.connect({}, function(frame) {
      console.log('connecting : '+ frame);
      that.stompClient.subscribe(that.topic, function(greeting){
        var result = greeting.body;
        // console.log(result);
          var obj = JSON.parse(result);
          console.log(obj);
            // var mode = obj[0].mode;
            that.showGreeting(obj);
      });
    });
  }

  disconnect() {
    if (this.stompClient !== null) {
        this.stompClient.disconnect();
    }
    // this.setConnected(false);
    console.log("Disconnected");
}

  sendMessage(message) {
    this.stompClient.send('/app/hello/', {}, JSON.stringify(message));
  }
  showGreeting(message) {
    this.IBHIGH = message.initialBalance.ibHigh;
    this.IBLOW = message.initialBalance.ibLow;
    this.F15MV = message.first15MinProfile.volume;
    this.vPOC = message.volumePOC.price;
    this.tVolA = message.tpoVolumeProfile.A;
    this.tVolB = message.tpoVolumeProfile.B;
    this.tVolC = message.tpoVolumeProfile.C;
    this.tVolD = message.tpoVolumeProfile.D;
    this.tVolE = message.tpoVolumeProfile.E;
    this.tVolF = message.tpoVolumeProfile.F;
    this.tVolG = message.tpoVolumeProfile.G;
    this.tVolH = message.tpoVolumeProfile.H;
    this.tVolI = message.tpoVolumeProfile.I;
    this.tVolJ = message.tpoVolumeProfile.J;
    this.tVolK = message.tpoVolumeProfile.K;
    this.tVolL = message.tpoVolumeProfile.L;
    this.tVolM = message.tpoVolumeProfile.M;
    //
    this.totalVolume = message.totalVolume;
    this.vWAP = message.vwap;
    this.LTP = message.latestTradedPrice;

    document.getElementById("openVolume").innerHTML = 'Open Volume :' + this.F15MV;

    this.IB = this.IBHIGH - this.IBLOW;
    // console.log(this.IB);


    document.getElementById("newIB").innerHTML = 'IB Value - ' + this.IB;

    // IB UP
    this.IB1_5UP = (this.IB * 0.5) + this.IBHIGH
    // console.log(this.IB1_5UP);
    this.IB2UP = (this.IB * 1) + this.IBHIGH
    // console.log(this.IB2UP);
    this.IB3UP = (this.IB * 2) + this.IBHIGH
    // console.log(this.IB3UP);

    // IB DOWN
    this.IB1_5DOWN = this.IBLOW - (this.IB  * 0.5)
    // console.log(this.IB1_5DOWN);
    this.IB2DOWN =  this.IBLOW  - (this.IB * 1)
    // console.log(this.IB2DOWN);
    this.IB3DOWN =  this.IBLOW - (this.IB * 2)
    // console.log(this.IB3DOWN);

    document.getElementById("LTP").innerHTML ='LTP - '+ this.LTP;


    document.getElementById("IBHIGH").innerHTML   =   'IB HIGH  : '+ this.IBHIGH;
    document.getElementById("IBLOW").innerHTML    =    'IB LOW   : '+ this.IBLOW;
    document.getElementById("IB15UP").innerHTML   =   '1.5 UP   : '+ this.IB1_5UP;
    document.getElementById("IB2UP").innerHTML    =    '2 UP     : '+ this.IB2UP;
    document.getElementById("IB3UP").innerHTML    =    '3 UP     : '+ this.IB3UP;
    document.getElementById("IB15DOWN").innerHTML = '1.5 DOWN : '+ this.IB1_5DOWN;
    document.getElementById("IB2DOWN").innerHTML  =  '2 DOWN   : ' + this.IB2DOWN;
    document.getElementById("IB3DOWN").innerHTML  =  '3 DOWN   : '+ this.IB3DOWN;
    this.dataForScale();
    this.barChart();
    this.comparisonChart();
  }

  async get(){

    // geting value from Api for bat chart
    var apiServer1 = await this.apiService.getRefData().toPromise();
    var apiRef = apiServer1['openVolAvg'];
    this.apiRefData = apiRef ;
    console.log(this.apiRefData);
    document.getElementById("referenceValue").innerHTML = 'Reference Value :' + this.apiRefData;

// getting value from api for testing chart
var prevValuesFromApi = await this.apiService.getPrevDayProfile().toPromise();
//pVPOC
var pVPOC = prevValuesFromApi['volumePOC'].price;
this.apiPrevDayVpoc = pVPOC ;
// console.log(this.apiPrevDayVpoc);
//VWAP
var pVWAP = prevValuesFromApi['vwap'];
this.apiPrevDayVwap = pVWAP ;
// console.log(this.apiPrevDayVwap);
//A
var volA = prevValuesFromApi['tpoVolumeProfile'].A;
this.pVolA = volA ;
// console.log(this.pVolA);
//B
var volB = prevValuesFromApi['tpoVolumeProfile'].B;
this.pVolB = volB ;
// console.log(this.pVolB);
//C
var volC = prevValuesFromApi['tpoVolumeProfile'].C;
this.pVolC = volC ;
// console.log(this.pVolC);
//D
var volD = prevValuesFromApi['tpoVolumeProfile'].D;
this.pVolD = volD;
// console.log(this.pVolD);
//E
var volE = prevValuesFromApi['tpoVolumeProfile'].E;
this.pVolE = volE;
// console.log(this.pVolE);
//F
var volF = prevValuesFromApi['tpoVolumeProfile'].F;
this.pVolF = volF ;
// console.log(this.pVolF);
//G
var volG = prevValuesFromApi['tpoVolumeProfile'].G;
this.pVolG = volG ;
// console.log(this.pVolG);
//H
var volH = prevValuesFromApi['tpoVolumeProfile'].H;
this.pVolH = volH ;
// console.log(this.pVolH);
//I
var volI = prevValuesFromApi['tpoVolumeProfile'].I;
this.pVolI = volI ;
// console.log(this.pVolI);
//J
var volJ = prevValuesFromApi['tpoVolumeProfile'].J;
this.pVolJ = volJ ;
// console.log(this.pVolJ);
//K
var volK = prevValuesFromApi['tpoVolumeProfile'].K;
this.pVolK = volK ;
// console.log(this.pVolK);
//L
var volL = prevValuesFromApi['tpoVolumeProfile'].L;
this.pVolL = volL ;
// console.log(this.pVolL);
//M
var volM = prevValuesFromApi['tpoVolumeProfile'].M;
this.pVolM = volM ;
// console.log(this.pVolM);

this.dataForScale();
this.barChart();
this.comparisonChart();

  }

  barChart(){
    var width = 300;
    var height = 180;
    var margin = { top:20, bottom:20, left:30, right:50 };
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    var OVP = this.apiRefData;
    var f15Value = this.F15MV;
    var data = [
      {name: "OpenVolume", value: f15Value},
      {name: "ReferenceValue", value: OVP},
    ];

d3.select('#barChart svg.graph').remove();
         const svg = d3.select('#barChart').append('svg')
         .attr('class','graph')
        //  .attr('width','100%')
         .attr('preserveAspectRatio', 'xMinYMin')
         .attr('viewBox','-65 0 ' +(width + margin.left + margin.right) +' ' +(height + margin.top + margin.bottom));
         //
  //grouping
    const g = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);
  //scale
    const x = d3.scaleLinear()
            .domain([0,d3.max(data,function(d){ return d.value; })])
            .rangeRound([0,innerWidth]).clamp(true).nice();
            const XaxisTickFormat = number => d3.format('.2s')(number).replace("G","B")
    const xA = d3.axisBottom(x).ticks(5).tickFormat(XaxisTickFormat);
              g.append('g').call(xA).attr('transform',`translate(0,${innerHeight})`);
    const y = d3.scaleBand()
            .domain(data.map(function(d){ return d.name}))
            .range([innerHeight,0]).padding(0.5);
    const yA = d3.axisLeft(y);
              g.append('g').call(yA);
  //creating the rect bar
    g.selectAll('rect').data(data)
                        .enter()
                        .append('rect')
                        .attr('y',function(d){
                          return y(d.name)
                        })
                        .attr('width',function(d){
                          return x(d.value)
                        })
                        .attr('height',y.bandwidth())
                        .attr('font-family','san-serif')
                        // .attr('fill','aqua');
         d3.selectAll('.tick text').attr('fill','black');
  }

  dataForScale(){
    //  data for scale chart
    var LTPvalue = this.LTP;
    var IBH = this.IBHIGH;
    var IBL = this.IBLOW;

    var pVPOC = this.apiPrevDayVpoc;
    var pVWAH = this.apiPrevDayVwap;

//IB_High values from socket
    var IB_1UP = this.IB1_5UP;
    var IB_2UP = this.IB2UP;
    var IB_3UP = this.IB3UP;
// IB_DOWN values from socket
    var IB_1DOWN = this.IB1_5DOWN;
    var IB_2DOWN = this.IB2DOWN;
    var IB_3DOWN = this.IB3DOWN;
//socket vPOC and vWAP
    var socketvPOC = this.vPOC;
    var socketvWAP = this.vWAP;
     this.data2 = [
      {"value":IBL,"labels":"IBL"},
      {"value":IBH,"labels":"IBH"},
      {"value":IB_1DOWN,"labels":"IB1.5D"},
      {"value":IB_2DOWN,"labels":"IB2D"},
      {"value":IB_3DOWN,"labels":"IB3D"},
      {"value":IB_1UP,"labels":"IB1.5U"},
      {"value":IB_2UP,"labels":"IB2U"},
      {"value":IB_3UP,"labels":"IB3U"},
      {"value":socketvPOC,"labels":"vPOC"},
      {"value":socketvWAP,"labels":"VWAP"},
      {"value":pVWAH,"labels2":"pVWAP"},
      {"value":pVPOC,"labels2":"pVPOC"},
      {"value":LTPvalue},
     ];

    this.data1;
    this.data = [...this.data1, ...this.data2];
    this.testingChart();
  }
  //testing chart
  testingChart(){
    var margin = { top:20, bottom:20, left:50, right:50 };
    var width = 500 - margin.left - margin.right;
    var height = 100 - margin.top - margin.bottom;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

var LTPvalue = this.LTP;
    d3.select('#thermo svg.unique').remove();
    var svg = d3.select('#thermo').append("svg")
    .attr("width", '100%')
    // .attr("height", '100%')
    .attr('class', 'unique')
    .attr('viewBox','-25 0 '+(width)+' '+(height))
    .attr('preserveAspectRatio','xMinYMin')
    .attr('transform',`translate(${margin.left},${margin.top})`) ;
    //creating scale
    const dataScale = d3.scaleLinear()
    .domain(d3.extent(this.data,d => d.value))
    .range([0,innerWidth]).nice();
    //this is only for ticks
    var uniqueValues = [...new Set(this.data.map(function(d) {
      return d.value;
    }))].map(function(d) {
      return (d);
    });
    //creating axes
    const axes1 = d3.axisBottom(dataScale).ticks(60,"~s");
        svg.append('g').call(axes1).attr('class','axix1')
                      .attr('transform','translate(0,21)');

    //removing tick text
    d3.selectAll('.axix1 .tick text').remove();

    //only showing the data value for ticks
    //this is for main datascale axes
    var axes = d3.axisBottom(dataScale).tickValues(uniqueValues).tickSizeInner(13).tickPadding(5);
    svg.append('g').call(axes).attr('class','axisValues1')
    .attr('transform','translate(0,21)');
    // d3.selectAll('.axisValues1 .tick line').remove();
    d3.selectAll('.axisValues1 .tick text')
              .attr('y',-5)
              .attr('x',1)
              .attr('fill','red')
              .attr('font-size',4)
              .attr('font-weight','500');

   //creating rect for showing values
              svg.append('rect')
              .attr('class','rectangle')
              .attr('x',function(d){
                return  dataScale(LTPvalue)
              })
              .attr('width',2)
              .attr("height",40)
              .attr('fill','green')
              .attr('opacity',0.8);

    // appending text
     svg.append('g').selectAll('text')
            .data(this.data)
            .enter()
            .append('text')
            .text(function(d){
              return d.labels
            })
            .attr('fill','blue')
            .attr('class','textLabel')
            .attr('text-anchor','middle')
            .attr('x',function(d){
                return dataScale(d.value) + 2
              })
            .attr('y',12)
            .attr('font-size',4)
            .attr('font-weight','500');

//text only for LTP data
            svg.append('text')
            .text("LTP")
            .attr('fill','black')
            .attr('class','font')
            .attr('font-size',4)
            .attr('text-anchor','middle')
            .attr('x',function(d){
                return dataScale(LTPvalue)
            })
            .attr('y',3)
            .attr('font-weight','900')
            .attr('fill','red');

// editing ticks values
            d3.select('svg .font .tick text').attr('fill','red');
// adding text for axes
            svg.append('g').selectAll('text')
            .data(this.data)
            .enter()
            .append('text')
            .text(function(d){
              return d.labels2
            })
            .attr('fill','blue')
            .attr('class','labelLabel')
            .attr('text-anchor','middle')
            .attr('x',function(d){
                return dataScale(d.value)
            })
            .attr('y',42)
            .attr('font-size',4)
            .attr('font-weight','500');
            d3.select(".a").remove();
  }

  comparisonChart(){

    var tA = this.tVolA;
    var tB = this.tVolB;
    var tC = this.tVolC;
    var tD = this.tVolD;
    var tE = this.tVolE;
    var tF = this.tVolF;
    var tG = this.tVolG;
    var tH = this.tVolH;
    var tI = this.tVolI;
    var tJ = this.tVolJ;
    var tK = this.tVolK;
    var tL = this.tVolL;
    var tM = this.tVolM;

    //
    var pA = this.pVolA;
    var pB = this.pVolB;
    var pC = this.pVolC;
    var pD = this.pVolD;
    var pE = this.pVolE;
    var pF = this.pVolF;
    var pG = this.pVolG;
    var pH = this.pVolH;
    var pI = this.pVolI;
    var pJ = this.pVolJ;
    var pK = this.pVolK;
    var pL = this.pVolL;
    var pM = this.pVolM;

    var data = [
      {sports:"A", prevVol: pA,curVol: tA, ages:[]},
      {sports:"B", prevVol: pB,curVol: tB, ages:[]},
      {sports:"C", prevVol: pC,curVol: tC, ages:[]},
      {sports:"D", prevVol: pD,curVol: tD, ages:[]},
      {sports:"E", prevVol: pE,curVol: tE, ages:[]},
      {sports:"F", prevVol: pF,curVol: tF, ages:[]},
      {sports:"G", prevVol: pG,curVol: tG, ages:[]},
      {sports:"H", prevVol: pH,curVol: tH, ages:[]},
      {sports:"J", prevVol: pI,curVol: tI, ages:[]},
      {sports:"K", prevVol: pJ,curVol: tJ, ages:[]},
      {sports:"L", prevVol: pK,curVol: tK, ages:[]},
      {sports:"M", prevVol: pL,curVol: tL, ages:[]},
      {sports:"M", prevVol: pM,curVol: tM, ages:[]},
    ];
//
var margin = { top:50, bottom:50, left:100, right:100 };
    var width = 500 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
//creating svg
    d3.select('#horizontal-bar svg.bar').remove();

    const svg = d3.select('#horizontal-bar').append('svg')
                .attr('class','bar')
                .attr('width','100%')
                .attr('preserveAspectRatio', 'xMinYMin')
                .attr('viewBox','0 30 ' +(width + margin.left + margin.right) +' ' +(height + margin.top + margin.bottom));

                // .attr('width',width + margin.left + margin.right)
                // .attr('height',height + margin.top + margin.bottom);
          const g = svg.append('g')
                .attr('transform',`translate(${margin.left},${margin.top})`);
  var teams = Object.keys(data[0]).filter(function(key) { return (key !== "sports" && key !== "ages"); });
// scale for first bar
data.forEach(function(d) {
  d.ages = teams.map(function(name) { return {name: name, value: + d[name]}; });
});

    var xDomain = data.map(d => d.sports)
    var x0 = d3.scaleBand()
                    .domain(xDomain)
                    .rangeRound([0,width]).paddingInner(0.05);
// scale for first bar
    var x1 = d3.scaleBand()
                    .domain(teams)
                    .range([0,x0.bandwidth()]).paddingOuter(0.5);
// creating x axis
    var xAxis1 = d3.axisBottom(x0);
        g.append('g').attr('class','xaxis').attr('transform',`translate(0,${height})`).call(xAxis1);
  d3.selectAll('.xaxis .tick text').attr('fill','grey');
  // y
  var yScale = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })])
  .range([height,0]).nice();
  // y axis
  var yAxis = d3.axisLeft(yScale);
  g.append('g').attr('class','yaxis').call(yAxis);

  d3.selectAll('.yaxis .tick text').attr('fill','grey');

  var color = d3.scaleOrdinal(d3.schemeCategory10);
    var state = svg.selectAll(".state")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.sports) + ",0)"; });

var rect =   state.selectAll("rect")
      .data(function(d) { return d.ages; })
      .enter().append("rect")
      .attr("width", x1.bandwidth())
      .attr("x", function(d) { return x1(d.name)+ 100; })
      .attr("y", function(d) { return yScale(d.value) + 50; })
      .attr("height", function(d) { return height - yScale(d.value); })
      .style("fill", function(d) { return color(d.name); });
  //
  var legendLabel = ["curVol","prevVol"]
  var legend = g.selectAll(".legend")
  .data(legendLabel)
.enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(0," + i * 10 + ")"; });

legend.append("rect")
  .attr("x", width + 35)
  .attr("width", 8)
  .attr("height", 8)
  .style("fill", function(d,i){
    return color(d)
  });

legend.append("text")
  .attr("x", width + 30)
  .attr("y", 3)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .attr('font-size',10 + 'px')
  .text(function(d) { return d; });

  }  

}

