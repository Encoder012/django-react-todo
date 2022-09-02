import './App.css';
import React from 'react';
import axios from 'axios';
import { useToasts, ToastProvider } from 'react-toast-notifications'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css';

const Toast = () => {
  const { addToast } = useToasts()
  return (
    <button id="success2" style={{display: "none"}} onClick={() => addToast('successfully added!!', {
      appearance: 'success',
      autoDismiss: true,
    })}>
      Add Toast
    </button>
  )
}

class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      count: 0,
      editing: false,
      todoList: [],
      activeItem: {
      id: null,
      title: "",
      description: "",
      completed: false
    }
  }
    this.fetchData = this.fetchData.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.editingMode = this.editingMode.bind(this)
    this.updateDatabase = this.updateDatabase.bind(this)
    this.taskStatus = this.taskStatus.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.abort = this.abort.bind(this)
    this.countTask = this.countTask.bind(this)
  }

  componentDidMount(){
    this.fetchData()
    this.countTask()
  }

  countTask(){
    var total = this.state.todoList
    console.log('total:',total)
  }
  fetchData(){
    axios.get('/api/todos')
    .then((response)=>{
      let completedCount = 0;
      response.data.forEach((e)=>{
        if(!e.completed){
          completedCount+=1
        }
      })
      console.log(response.data)
      console.log(completedCount)
      this.setState( state =>({
        count: completedCount,
        todoList: response.data
      }))
    })
  }
  editingMode(e){
    var item = e.target.getAttribute('data-dict')
    document.getElementsByClassName('editingData')[0].style.transform = 'translate(-50%, -50%) scaleY(1)'
    item = JSON.parse(item)
    console.log(item)
    this.setState({
      editing: true,
      activeItem: item
    })
    
  }

  renderList(){
    var itemList = this.state.todoList

    return itemList.map(item => 
      (
        <li className="listBox" style={{listStyle: 'none', paddingTop: '10px', borderTopWidth:'1px' ,borderTopColor: 'rgb(136 136 136 / 20%)',borderTopStyle: 'groove' }} key={item.id} >
          <div style={{display: 'flex' , paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px'}}>
          <div style={{textDecoration: item.completed ? 'line-through' : 'none', marginRight: 'auto', textOverflow: 'ellipsis', width: '25vw', overflow: 'hidden', whiteSpace: 'nowrap'}}  >
            {item.title}
          </div>
          <div style={{marginLeft: 'auto', float: 'left'}} >
          <button className='btn btn-sm btn-outline-info mr-1' data-dict={JSON.stringify(item)} onClick={this.editingMode} >View</button>
          <button className='btn btn-sm btn-outline-success mr-1' data-dict={JSON.stringify({"item":item,"status":true})} onClick={this.taskStatus} disabled={item.completed} >✔</button>
          <button className='btn btn-sm btn-outline-danger mr-1' data-dict={JSON.stringify({"item":item,"status":false})} onClick={this.taskStatus} disabled={!item.completed} >❌</button>
          <button className='btn btn-sm btn-outline-dark' data-dict={JSON.stringify(item)} onClick={this.handleDelete}>➖</button>
          </div>
          </div>
          <br />

        </li>
      )
    )
  }

  handleChange(e){
    document.getElementById('saveChanges').style.display = 'block'
    document.getElementById('cancelBtn').innerHTML = 'Cancel'
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        [e.target.name] : e.target.value
      }
    })
  }
  updateDatabase(item){
    axios.put(`/api/todos/${item.id}/`,item)
    .then((response)=>{
      this.fetchData()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          description: '',
          completed: false
        }
      })
    })
  }
  taskStatus(e){
    var value = e.target.getAttribute('data-dict')
    value = JSON.parse(value)
    value.item.completed = value.status

    this.updateDatabase(value.item)
  }
  handleDelete(e){
    var item = JSON.parse(e.target.getAttribute('data-dict'))
    axios.delete(`/api/todos/${item.id}/`)
    .then((response)=>{
      this.fetchData()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          description: '',
          completed: false
        }
      })
    })
    
  }
  handleSubmit(e){
    document.getElementById('saveChanges').style.display = 'none'
    document.getElementById('cancelBtn').innerHTML = 'Close'
    e.preventDefault()
    console.log('ITEM: ',this.state.activeItem)
    var editing = this.state.editing
    if (editing){
        console.log("changed", this.state.activeItem)
        this.setState({
          editing: false
        })
        this.updateDatabase(this.state.activeItem)
    }else{
    axios.post('/api/todos/',this.state.activeItem)
    .then((response)=>{
      toast("successfully added!!",{
        className: "toastBack",
        bodyClassName: "toastBackBody",
      })
      this.fetchData()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          description: '',
          completed: false
        }
      })
    })
    .catch((e)=>{
      toast("An error occurred!!",{
        className: "toastBackError",
        bodyClassName: "toastBackBody",
      })
      console.log('an error occurred!!', e)
    })
    
  }
  }
  abort(e){
    document.getElementById('saveChanges').style.display = 'none'
    document.getElementById('cancelBtn').innerHTML = 'Close'
    e.preventDefault()
    this.setState({
      activeItem: {
        id: null,
        title: '',
        description: '',
        completed: false
      },
      editing: false
    })
  } 

  render(){
    // setTimeout(()=>{
    //   document.getElementById("success2").click()

    // },1000)
    
    
    return(
      <>
        <div onClick={this.abort} className={this.state.editing ? 'editData' : 'hideElement'} >
        <div onClick={(e)=>{e.stopPropagation()}} style={{transform: 'translate(-50%, -50%) scaleY(0)', transition: 'ease 2s!important'}} className='editingData'>
        <form onSubmit={this.handleSubmit} id="form">
          <div style={{display:"inline-grid"}}>
        <label style={{textAlign: 'center'}} htmlFor="title">TITLE</label>
        <input onChange={this.handleChange} type="text" name="title" placeholder="title" value={this.state.activeItem.title} />
        <br />
        <label style={{textAlign: 'center'}} htmlFor="description">DESCRIPTION</label> 
        <textarea style={{boxSizing:'border-box'}} onChange={this.handleChange} type="text" name="description" placeholder="description" value={this.state.activeItem.description}/>
        <br />
        <input id='saveChanges' style={{display: 'none'}} className="btn btn-sm btn-outline-success mb-1" type="submit" value="Save changes" />
        <button id='cancelBtn' className="btn btn-sm btn-outline-danger" onClick={this.abort} > Close </button>
        </div>
      </form>
        </div>
        </div>
        <div className='todoDiv' >
          <div className="heading" >
      <h1>
      📃TODO LIST
      </h1>
          </div>
          <div className="taskInfo" >
            <p> You have {this.state.count} incomeplete tasks</p>
          </div>
      <div className='addTodoDiv' >
      <form onSubmit={this.handleSubmit} id="form">
        <input onChange={this.handleChange} type="text" name="title" placeholder="title" value={this.state.activeItem.title} />
        <input onChange={this.handleChange} type="text" name="description" placeholder="description" className='m-1' value={this.state.activeItem.description}/>
        <input style={{boxSizing: 'border-box', marginBottom: '5px'}} className="btn btn-sm btn-outline-warning" value="Add" type="submit"/>
      </form>
      </div>
      <div className='todosList' >
        <ul style={{padding: '20px', paddingTop: '0px'}}>
          {this.renderList()}
        </ul>
      </div>
      </div>
      <ToastContainer />
      {/* <ToastProvider>
        <Toast />
      </ToastProvider> */}
      </>

    )
  }


}




export default App;
