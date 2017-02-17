import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import { Table } from 'react-bootstrap';



//Firebase dependencies
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

/*The constructor for a React component is called before it is mounted. 
    When implementing the constructor for a React.Component subclass, you should call super(props) before any other statement.*/
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: [],
      submitted: false,
      editMode: false,
      editFields: []
    }

    //handle Actions
    this._editFirebaseData = this._editFirebaseData.bind(this); //this updates the firebase record
    this._setFireBaseDataEditTable = this._setFireBaseDataEditTable.bind(this); //Sets the UUID we are going to modify
    this._handleFirebaseFormChange = this._handleFirebaseFormChange.bind(this);
    this._cancelFirebaseEdit = this._cancelFirebaseEdit.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  //loading information from database
  //These methods are called when an instance of a component is being created and inserted into the DOM (i.e. componentDidMount, comstructor, etc):
  componentDidMount() {
    this._loadFirebaseData();
  }

  //loading data from firebase
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

  //Allows us to edit the fields and set the data back to itself.
  //It's a ReactJS requirement
  //Here's a good reference: http://stackoverflow.com/questions/22220873/how-to-reload-input-value-in-react-javascript-with-virtual-dom
  handleChange(event) {
    var change = {};
    change[event.target.name] = event.target.value;
    //console.log("Field Updated");
    //console.log(event.target.name);
    this.setState({ editFields: change });
  }

  //controls our cancel button
  _cancelFirebaseEdit(event) {
    event.preventDefault();
    this.setState({ editMode: false });

  }
  //controls our input on the fly
  _handleFirebaseFormChange(event) {
    event.preventDefault();
    this.props.onChange(event.target.value);
  }

  _setFireBaseDataEditTable(event) {
    event.preventDefault();

    const recordId = event.target.value;

    this.setState({
      editMode: true,
      editUUID: event.target.value,
      editFields: []
    });

    var self = this; //We loose what this is once we go into the firebase database

    //Query the firebase data
    firebase.database().ref().child('inventory-app/').orderByChild("uuid").on('value',
      (snapshot) => {
        snapshot.forEach(function (child) {
          //console.log(child.val()) // NOW THE CHILDREN PRINT IN ORDER
          var value = child.val();
          var name = value.inventory.name;
          var quantity = value.inventory.quantity;
          var description = value.inventory.description;
          var uuid = value.inventory.uuid;
          var editFields = {};

          if (uuid === recordId) {
            //console.log(value);
            editFields["name"] = name;
            editFields["quantity"] = quantity;
            editFields["description"] = description;
            editFields["uuid"] = uuid;

            self.setState({ editFields: editFields });

          }
        });
      }
    )
  }

  //handles our event when we click the edit function
  _editFirebaseData(event) {
    event.preventDefault();
    //Getting the values of each child type input
    var details = {};
    event.target.childNodes.forEach(function (el) {
      if (el.tagName === 'INPUT') {
        details[el.name] = el.value
      }
    });

    //Resetting the property value

    var uuid2 = details["uuid"];
    var self = this;

    //console.log("Update UUID " + uuid2);

    firebase.database().ref().child('inventory-app/' + uuid2)
      .update({ inventory: details });

    this._loadFirebaseData();

    this.setState({
      editMode: false
    });
  }

  //handles our event when we click on the the delete button
  _handleOnClick(event) {
    event.preventDefault();

    //console.log(event.target.value)
    //removes one element

    var uuid3 = event.target.value;

    firebase.database().ref().child('inventory-app/' + uuid3)
      .remove();

    //reloads the data from firebase
    this._loadFirebaseData();
  }

  render() {
    var inputForm;
    var table;
    var rows;
    var editView;
    var output;

    inputForm = <div>
      <h2 className="h2_1">Please enter your inventory Item</h2>
      <form name="input" className="form-inline" onSubmit={this.onSubmit}>
        <input className="form-control" type="text" placeholder="Enter Name..." name="name" />
        <input className="form-control" type="text" placeholder="Enter description..." name="description" />
        <input className="form-control" type="text" placeholder="Enter quantity..." name="quantity" />
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
            <th> {item[s].inventory.description} </th>
            <th> {item[s].inventory.quantity} </th>
            <th>
              <button className="btn btn-danger" value={item[s].inventory.uuid} onClick={self._handleOnClick.bind(self)}>Delete</button>
              <button className="btn btn-info" value={item[s].inventory.uuid} onClick={self._setFireBaseDataEditTable}>Edit</button>
            </th>
          </tr>
        )
      });
    });

    table = (
      <div className="table-div">
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th className="t-head"> Name </th>
              <th className="t-head"> Description </th>
              <th className="t-head"> Quantity </th>
              <th className="t-head"> Action </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    )

    editView = (
      <div>
        <h2 className="h2_1">Please Make Edits</h2>
        <form className="form-inline" onSubmit={this._editFirebaseData}>
          <input className="form-control" type="text" value={this.state.editFields.name} onChange={this.handleChange} name="name" />
          <input className="form-control" type="text" value={this.state.editFields.description} onChange={this.handleChange} name="description" />
          <input className="form-control" type="text" value={this.state.editFields.quantity} onChange={this.handleChange} name="quantity" />
          <input className="form-control" type="text" className="hide input" value={this.state.editFields.uuid} name="uuid" />
          <button className="btn btn-primary" type="submit" type="submit" >Submit</button>
          <button className="btn btn-default" onClick={self._cancelFirebaseEdit}>Cancel</button>
        </form>
      </div>
    );


    if (this.state.editMode) {
      output = (
        <div className="App">
          <div className="App-header">
            <h2 className="h2_2">Coffee Inventory App</h2>
            <ul className="nav nav-pills">
              <li role="presentation" class="active"><a href="#">Home</a></li>
              <li role="presentation"><a href="#">Inventory</a></li>
              <li role="presentation"><a href="#">Edit Form</a></li>
            </ul>
            <img src="https://c1.staticflickr.com/4/3759/32940464915_43cd06aa2a_z.jpg" width="200" height="100" alt="coffee-cup-background-1 (1)" />
          </div>
          <div className="text-center">
            {editView}
          </div>
        </div>
      );
    } else {
      output = (
        <div>
          <div className="App-header">
            <h2 className="h2_2">Coffee Inventory App</h2>
            <ul className="nav nav-pills">
              <li role="presentation"><a href="#">Home</a></li>
              <li role="presentation"><a href="#">Inventory</a></li>
              <li role="presnetation"><a href="#">Edit Form</a></li>
              </ul>
            <img src="https://c1.staticflickr.com/4/3759/32940464915_43cd06aa2a_z.jpg" width="200" height="100" alt="coffee-cup-background-1 (1)" />
          </div>
          <div className="text-center">
            {inputForm}
            {table}
          </div>
        </div>
      );
    }

    return (
      <div className="App">
        {output}
      </div>
    );
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
