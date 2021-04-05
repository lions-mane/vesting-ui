import React from 'react'
import { DropdownButton, Dropdown } from "react-bootstrap";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Web3 from 'web3'
import './App.css';

import VestingUI from './vestingUI'

const Interface = function({ match }) {
  const web3 = new Web3()
  const { address } = match.params

  return web3.utils.isAddress(address)
    ? <VestingUI address={ address } />
    : <Empty />
}

const Empty = () => (
  <>
    <DropdownButton title="Select Vesting Contract ">
      <Dropdown.Item href="/0x90D93f5A390bFDBC401f92e916197ee17470a447">0x90D93f5A390bFDBC401f92e916197ee17470a447</Dropdown.Item>
      <Dropdown.Item href="/0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050">0x9c4a4204b79dd291d6b6571c5be8bbcd0622f050</Dropdown.Item>
    </DropdownButton>
  </>
)

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:address" component={ Interface }/>
        <Route component={ Empty } />
      </Switch>
    </Router>
  );
}

export default App;
