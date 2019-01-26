import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {DataProvider, useStore} from "./data/data-provider";
import {Tournaments} from "./components/tournaments";

class App extends Component {
  render() {
    return (
        <DataProvider>
            <Tournaments />
        </DataProvider>
    );
  }
}

export default App;
