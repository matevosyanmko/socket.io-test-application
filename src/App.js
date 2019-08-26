import React,{Fragment} from 'react';
import io from 'socket.io-client';
import "./App.css";

// socket.io initializze function 
const socket =(host,path,options)=>io(host,{path,query: {...options}});

class App extends React.Component{
  constructor(){
    super()
    this.sock=null;
    this.state={
      connected:false,
      host:"",
      path:"",
      options:[{key:"",value:""}],
      room:"",
      data:"",
      field:"",
      recievedMessages:[],
      sendMessages:[],
      topics:[]
    }
  }

  connect=(event)=>{
    event.preventDefault();
    const {host,path,options}=this.state;
    
    // recieve options object
    let obj={}
    options.map(it=> obj[it.key]=it.value);

    // initializze socket
    this.sock=socket(host,path,obj);
    // add events

    // on connect
    this.sock.on("connect",()=>{
      console.log("socket connected");
      this.setState({connected:this.sock.connected})
    })

    // on disconnect
    this.sock.on("disconnect",()=>{
      console.log("socket disconnected");
      this.setState({connected:this.sock.connected})
    })
  }

  // disconnect from socket
  disconnect=()=>this.sock.disconnect()

  // emmit message 
  emmit=(ev)=>{
    ev.preventDefault();
    const {room,data,field,sendMessages}=this.state;
    this.sock.emit(room,JSON.stringify({[field]:Number(data)}));
    this.setState({sendMessages:[...sendMessages,{[field]:Number(data)}]})
    }

  // on component unmoun disconnect from socket 
 componentWillUnmount=()=>{
    if( this.sock && this.sock.connected) this.disconnect() 
  }

  // check string length
  isEmpty = str => str === null || str.match(/^ *$/) !== null;

  // add topic
  addTopic=()=>{
      const topic=document.getElementById("topic");
      if(!this.isEmpty(topic.value)){
          this.setState({topics:[...this.state.topics,topic.value]},
          ()=>{
            this.joinTopic(topic.value);
            topic.value=""
              })
      }
  }

  // subscribe to topic
  joinTopic=(topic)=>{
    this.sock.on(topic,(data)=> {
      console.log("socket message",data);
      if(topic==="orderData"){
      const {recievedMessages}=this.state;
      this.setState({recievedMessages:[...recievedMessages,data]})
    }
    })
  }

// remove and unsubscribe from topic
  removeTopic=(topic)=> this.setState({topics:this.state.topics.filter((it)=>it!==topic)},()=>this.sock.off(topic))

  render(){
    const {connected,host,path,options,room,data,field,recievedMessages,sendMessages,topics}=this.state;
    const state=connected ? "connected" :"disconnected";
    return (
   <div >
     <h1>Socket : {state}</h1>
     {!connected ? 
     <>
     <h3 children="Initialization "/>
     <form onSubmit={this.connect} autoComplete="true" id="initialization">
      <div className="fluid">
      <input placeholder="Host" name="host" value={host} onChange={(event)=>this.setState({host:event.target.value})} />
      <input placeholder="Path" name="path" value={path} onChange={(event)=>this.setState({path:event.target.value})}/>
     <h4 children="Options "/>
     {options.length  ? options.map((item,key)=>
     <div className="pairs" key={key}>
     <input placeholder="Key" name="key" value={options[key].key} onChange={(event)=>this.setState({options:options.map((it,index)=>index===key ? {...it,[event.target.name]:event.target.value}:it  )})}/>
     <input placeholder="Value" name="value" value={options[key].value} onChange={(event)=>this.setState({options:options.map((it,index)=>index===key ? {...it,[event.target.name]:event.target.value}:it )})}/>
     
     <button onClick={()=>this.setState({options:[...options,{key:"",value:""}]})}>+</button>
     {key> 0 && <button onClick={()=>this.setState({options:options.filter((it,ind)=>ind!==key)})}>-</button>}
    </div>
      ):
     null}
     <button   children="CONNECT"   />
     </div>
    </form>
    </>:<Fragment>
        <h3 children="Listen to topics "/>
     <div className="pairs">
     {topics.map((item,key)=>
      <>
        <input  placeholder="Type Topic name" value={item} disabled={true} key={key} style={{width:"150px"}} />
        <button onClick={()=>this.removeTopic(item,key)}>-</button>
        </>
          
     )} 
     <input  placeholder="Type Topic name" style={{width:"150px"}} id="topic" />
     <button onClick={this.addTopic}>+</button>
     </div>
     <h3 children="Emmit "/>
        <form onSubmit={this.emit} autoComplete="true">
        <input placeholder="Room" name="room" value={room} onChange={(event)=>this.setState({room:event.target.value})} />
        <input placeholder="Key name" name="key" value={field} onChange={(event)=>this.setState({field:event.target.value})} />
        <input placeholder="Key value" name="value" value={data} onChange={(event)=>this.setState({data:event.target.value})} />
        <button  children="EMMIT"   onClick={this.emmit}  />
    </form>
    <h3 children="Disconnect "/>
    <button onClick={this.disconnect}  children="DISCONNECT"  />
    <h3 children="Emitted messages"/>
      {sendMessages.map((item,key)=><p key={key} children={JSON.stringify(item)}/>)}
    <h3 children="Recieved messages "/>
    {recievedMessages.map((item,key)=><p key={key} children={JSON.stringify(item)}/>)}
    </Fragment>}
  </div>
  )
}
}

export default App;
