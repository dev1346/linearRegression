const PRECISION=2
let model
let chart

function init(){
    reset()
    // let dropArea = document.getElementById("Editor")
    // dropArea.addEventListener("drop", drop, false);
}

async function loadFile(){
    let f=document.getElementById("loadFile")
    let res = new Response(f.files[0])
    let result = await res.text()
    let e=document.getElementById("Editor");
    e.textContent = result
    loadData()
}

async function drop(event) {
    event.stopPropagation();
    event.preventDefault();

    let file = event.dataTransfer.files[0];
    let res = new Response(file)
    let e=document.getElementById("Editor");
    e.textContent = await res.text()    
    loadData()
}

function loadData(){
    reset()
    let e=document.getElementById("Editor")
    let j=csvToJson(e.value)
    if(j.length>0){
        model.labels = Object.keys(j[0])
        
        model.xmin = Number(j[0][model.labels[0]])
        model.xmax = Number(j[0][model.labels[0]])
        model.ymin = Number(j[0][model.labels[1]])
        model.ymax = Number(j[0][model.labels[1]])
        
        j.forEach(ele=>{
            if(Number(ele[model.labels[0]])<model.xmin){model.xmin=Number(ele[model.labels[0]])}
            if(Number(ele[model.labels[0]])>model.xmax){model.xmax=Number(ele[model.labels[0]])}
            if(Number(ele[model.labels[1]])<model.ymin){model.ymin=Number(ele[model.labels[1]])}
            if(Number(ele[model.labels[1]])>model.ymax){model.ymax=Number(ele[model.labels[1]])}
            model.data.push({x:Number(ele[model.labels[0]]),y:Number(ele[model.labels[1]])})
        })
        model.count = model.data.length
    }
    draw()
}

function linearRegression(){
    loadData()
    // if(model.count>0){
    //     model.data.forEach(element => {
    //         model.xavg+=Number(element.x)
    //         model.yavg+=Number(element.y)
    //     });
    //     model.xavg/=model.count
    //     model.yavg/=model.count
    
    //     model.data.forEach(element=>{
    //         model.xxavg+=Number(element.x-model.xavg)*Number(element.x-model.xavg)
    //         model.xyavg+=Number(element.x-model.xavg)*Number(element.y-model.yavg)
    //     })
    //     model.xxavg/=model.count
    //     model.xyavg/=model.count
    //     model.B = model.xyavg/model.xxavg
    //     model.A = model.yavg - model.B * model.xavg
    // }
    if(model.count>0){
        model.data.forEach(element => {
            model.xavg+=Number(element.x)
            model.yavg+=Number(element.y)
            model.xxavg+=Number(element.x)*Number(element.x)
            model.xyavg+=Number(element.x)*Number(element.y)
        });
        model.xavg/=model.count
        model.yavg/=model.count
        model.xxavg/=model.count
        model.xyavg/=model.count        
        model.B = (model.xyavg-model.xavg*model.yavg)/(model.xxavg-model.xavg*model.xavg)
        model.A = model.yavg - model.B * model.xavg
    }
    show()
    draw(true)
}

function linearEstimation(){
    let xest = prompt(`Which ${model.labels[0]}?`,model.xmin)
    let yest = model.A+ model.B*xest
    model.est.push({x:xest,y:yest})
    let o=document.getElementById("Output")
    o.textContent+=`\n${model.labels[1]}@${model.labels[0]}=${Number(xest).toFixed(PRECISION)}\n${Number(yest).toFixed(PRECISION)}`
    draw(true,true)
}

function reset(){
    if(chart){chart.destroy()};
    document.getElementById("Output").textContent = ""
    model = {A:null,B:null,count:0,xavg:0,yavg:0,xyavg:0,xxavg:0,labels:["",""],data:[],est:[],xmin:null,xmax:null,ymin:null,ymax:null}
}

function show(){
    let o=document.getElementById("Output")
    o.textContent= `${model.labels[0]}_avg=${model.xavg.toFixed(PRECISION)}\n${model.labels[1]}_avg=${model.yavg.toFixed(PRECISION)}
    \nY=A+B*X\nA=${model.A.toFixed(PRECISION)}\nB=${model.B.toFixed(PRECISION)}
    \nY=A+B*(X-${model.xavg.toFixed(PRECISION)})\nA=${(model.A+model.B*model.xavg).toFixed(PRECISION)}\nB=${model.B.toFixed(PRECISION)}\n`
}

function csvToJson(csv){
  var lines=csv.split("\n");
  var result = [];
  var headers=lines[0].split(",");
  for(var i=1;i<lines.length;i++){
      var obj = {};
      var currentline=lines[i].split(",");

      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
  }
  return result; //JavaScript object
  //return JSON.stringify(result); //JSON
}

function draw(regression=false,estimation=false) {
    if(chart){chart.destroy()};
    let ds=[]
    ds.push({fill: false,label:"data",pointRadius:5,borderColor:"tan",backgroundColor:'tan',xAxisID:"xachse",yAxisID:"yachse",
            data:model.data})
    if(regression){
        ds.push({fill: false,label:"regression",borderColor:"wheat",backgroundColor:'wheat',showLine: true,lineTension: 0,pointRadius:0,
            data:[{x:model.xmin,y:model.A+model.B*model.xmin},
                {x:model.xmax,y:model.A+model.B*model.xmax}]})
        }
    if(estimation){
        ds.push({fill: false,label:"estimation",borderColor:"rgb(126, 102, 72)",backgroundColor:'rgb(126, 102, 72)',showLine: false,pointRadius:5,pointStyle:"star",
            data:model.est})
        }

	chart = new Chart('Chart',{
        type: 'scatter',
		data: {
			datasets:ds
            },
        options:{
            scales:{
                xAxes:[{
                    scaleLabel:{
                        display:true,
                        labelString:model.labels[0],
                    },
                    id:"xachse"
                }],
                yAxes:[{
                    scaleLabel:{
                        display:true,
                        labelString:model.labels[1],
                    },
                    id:"yachse"
                }]

            }
        }
    })
}   
