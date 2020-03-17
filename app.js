const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


const port=process.env.PORT||3000;


app.get('/',(req,res)=>res.status(200)
.json({"Success":"Deployed Successfully"}));


app.post('/extract',async function(req,res){
let links=[],linkArray=[],titleNodeList=[],siteUrl,i,arro=[],page,ic=[],j;
const browser=await puppeteer.launch({ args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],headless:true});
page=await browser.newPage();
try{
siteUrl=req.body.url;
await page.goto(siteUrl,{waitUntil:"networkidle2",timeout:0});
links=await page.evaluate(siteUrl=>{
titleNodeList=document.querySelectorAll("a");
linkArray=[];
for (i=0;i<titleNodeList.length;++i){
link=titleNodeList[i].getAttribute("href");
if(link!==null&&link!=='javascript: void(0)'&&link[0]!=='#'&&
link!==undefined&&typeof link=='string'&&link!==""){
if(link[0]=='/')
linkArray.push(siteUrl+decodeURIComponent(link.substring(1)));
else 
linkArray.push(decodeURIComponent(link));
}}
return linkArray;
},siteUrl);


ic=await page.evaluate(()=>{
titleNodeList=document.querySelectorAll("img");
linkArray=[];
for (i=0;i<titleNodeList.length;++i){
link=titleNodeList[i].getAttribute("src");
if(link!==null&&link!=='javascript: void(0)'&&link[0]!=='#'&&
link!==undefined&&typeof link=='string'&&link!=="")linkArray.push(link);}
return linkArray;});


arro=links.filter((a,b)=>{if(a.includes(siteUrl))return a;});
arro=Array.from(new Set(arro));


// for(i=0;i<arro.length;++i){
//     const url=arro[i];
//     await page.goto(`${url}`,{waitUntil:"networkidle2",timeout:0});
//     try{await page.waitForSelector("img");}
//     catch(e){ continue;}
//     ic=await page.evaluate(()=>{
//     titleNodeList=document.querySelectorAll("img");
//     linkArray=[];
//     for (i=0;i<titleNodeList.length;++i){
//     link=titleNodeList[i].getAttribute("src");linkArray.push(link);
//     }
//     return linkArray;
//     });
// }


await browser.close();
ic.forEach((a,b)=>{
    {if(a[0]=='.'&&a[1]=='/')ic[b]=siteUrl+a.substring(2);
    else if(a[0]=='/'&&a[1]=='/')ic[b]=a;
    else if(a[0]=='/'&&a[1]!=='/')ic[b]=siteUrl+a.substring(1);
    else ic[b]=a;}
});
ic=Array.from(new Set(ic));


res.status(200).json({"extractedUrls":arro,"extractedImages":ic});
// res.status(200).json({"extractedUrls":arro});
}
catch(e){console.log(e);}});



app.listen(port,()=>console.log(`Server is runnig at port ${port}`));








