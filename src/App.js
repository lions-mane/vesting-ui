import React, {useEffect, useState} from 'react'
import {Dropdown} from "react-bootstrap";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import './App.css';

import VestingUI from './vestingUI'
import TokenVesting from "./TokenVesting.json";

const vestingContractAddress = '0xd831191E800D2353cE18593a2B59824546559cBc';

const Interface = function({ match }) {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);

    const { contractAddress, scheduleID } = match.params

    return (web3.utils.isAddress(contractAddress))
        ? <VestingUI contractAddress={ contractAddress } scheduleID={Number(scheduleID)} />
        : <Empty />
}

const Empty = () => {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);
    const token = new web3.eth.Contract(TokenVesting.abi, vestingContractAddress);

    const [numberOfSchedules, setNumberOfSchedules] = useState(0);

    useEffect(() => {
        getData()
    }, []);

    async function getData() {
        const accounts = await web3.eth.getAccounts();
        const numSchedules = await token.methods.numberOfSchedules(accounts[0]).call();
        setNumberOfSchedules(numSchedules);
    }

    const arrayScheduleID = new Array(Number(numberOfSchedules));

    for(let i = 0; i < arrayScheduleID.length; i++){
        arrayScheduleID[i] = i;
    }

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Dropdown>
                    <Dropdown.Toggle variant="outline-primary">Select Vesting Contract </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            href={'/' + vestingContractAddress + '/0'}>{ vestingContractAddress}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </>
    )
}

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/:contractAddress/:scheduleID" component={ Interface }/>
                <Route component={ Empty } />
            </Switch>
        </Router>
    );
}

export default App;
