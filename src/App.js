import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import { Table, Breadcrumb, Button, ButtonToolbar } from 'react-bootstrap';

var uuid = require('uuid');
var firebase = require('firebase');


var config = {
  apiKey: "AIzaSyDHG6XCvuBUMe6ke2w40zRAD84P6n2Znik",
  authDomain: "inventory-app-e6637.firebaseapp.com",
  databaseURL: "https://inventory-app-e6637.firebaseio.com",
  storageBucket: "inventory-app-e6637.appspot.com",
  messagingSenderId: "756517082540"
};
firebase.initializeApp(config);

class App extends Component {
  constructor(props) {
    super(props);

/*The constructor for a React component is called before it is mounted. 
When implementing the constructor for a React.Component subclass, you should call super(props) before any other statement.*/

    this.state = {
      inventory: [],
      submitted: false,
      edit: false
    }

  }

  //loading information from database
  //These methods are called when an instance of a component is being created and inserted into the DOM (i.e. componentDidMount, comstructor, etc):
  componentDidMount() {
    this._loadFirebaseData();
  }

  _loadFirebaseData() {
    var self = this;
    this.setState({ inventory: [] });


    //Getting data from firebase 
    //A Reference represents a specific location in your Database and can be used for reading or writing data to that Database location.
    firebase.database().ref().once('value').then((snapshot) => {
      snapshot.forEach(function (data) {
        self.setState({
          inventory: self.state.inventory.concat(data.val())
        });
      });
    });
  }
  //handles our event when we click on the the delete button
  _handleOnClick(event) {
    event.preventDefault()
    console.log(event.target.value)
    //removes one element
    var uuid = event.target.value
    firebase.database().ref().child('inventory-app/' + uuid).remove();
    //reloads the data from firebase
    this._loadFirebaseData();
  }
//handles our event when we click the edit function
    _editFirebaseData(event) { 
    this.setState({ edit: true});
    //edits one element
    var uuid2 = uuid;
firebase.database().ref().child('/inventory-app/' + uuid2)
        .update({  });

  }



  render() {
    var inputForm;
    var table;
    var rows;
    var output;

    if(this.state.edit) {
      output = (
        <div>
          <form onSubmit={this.onSubmit.bind(this)}>
            <input />
          </form>
        </div>
      );
    } else {

    inputForm = <div>
      <h2>Please enter your inventory Item</h2>
      <form onSubmit={this.onSubmit.bind(this)}>
        <input className="bg-info" type="text" placeholder="Enter Name..." name="name" />
        <input className="bg-info" type="text" placeholder="Enter description..." name="description" />
        <input className="bg-info" type="text" placeholder="Enter quantity..." name="quantity" />
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>

    var self = this;

    rows = this.state.inventory.map(function (item, index) {

      //console.log(item);

      return Object.keys(item).map(function (s) {

        return (
          <tr key={s}>
            <th> {item[s].inventory.name} </th>
            <th> {item[s].inventory.quantity} </th>
            <th> {item[s].inventory.description} </th>
            <th>
              <button className="btn btn-danger" value={item[s].inventory.uuid} onClick={self._handleOnClick.bind(self)}>Delete</button>
              <button className="btn btn-info" value={item[s].inventory.uuid} onClick={self. _editFirebaseData.bind(self)}>Edit</button>
            </th>
          </tr>
        )
      });
    });

    table = (
      <div>
        <Table striped bordered condensed hover>
          <thead>
            <tr className="info">
              <th> Name </th>
              <th> Description </th>
              <th> Quantity </th>
              <th> Action </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    )

    output = (
      <div className="App">
        <div className="App-header">
          <h2>Inventory App</h2>
        </div>
        <div className="text-center">
          {inputForm}
          <br />
          {table}
        </div>
      </div>
    );
  }
    
  return output;
  }
  

  //adding our function that will handle our submit
  onSubmit(event) {
    event.preventDefault();

    //Creating our initial variables
    const details = {}
    const id = uuid.v1(); //generating our unique key

    //Go through each element in the form making sure it's an input element
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      } else {
        el.value = null
      }
      //Adding one more element uuid
      details['uuid'] = id;
    })

    //saving to our firebase    
    firebase.database().ref('inventory-app/' + id).set({
      inventory: details
    });

    this.setState({
      submitted: true
    })
    this._loadFirebaseData();
  }
}



export default App;
