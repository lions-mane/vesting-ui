import React, { useState, useEffect } from "react";
import {Dropdown, Table, Button} from 'react-bootstrap'
import { Line } from 'react-chartjs-2'
import moment from 'moment'
import TokenVesting from './TokenVesting.json';
import * as Icons from "react-icons/io5";

const Loading = () => {
  return (
    <div className='spinner'>
      <img src="/loading.gif" alt="loading" />
    </div>
    );
}

const TableRow = ({ title, children }) => {
  return (
    <tr>
      <th>{ title }</th>
      <td>
        { children }
      </td>
    </tr>
  )
}

const VestingUI = ({ contractAddress, scheduleID }) => {
  const Web3 = require('web3');
  const web3 = new Web3(Web3.givenProvider);
  const token = new web3.eth.Contract(TokenVesting.abi, contractAddress);

  const [loading, setLoading] = useState(true);
  const [numberOfSchedules, setNumberOfSchedules] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [startTimeDisplay, setStartTimeDisplay] = useState('');
  const [endTime, setEndTime] = useState(0);
  const [endTimeDisplay, setEndTimeDisplay] = useState('');
  const [cliffTime, setCliffTime] = useState(0);
  const [cliffTimeDisplay, setCliffTimeDisplay] = useState('');

  const [timeTilCliff, setTimeTilCliff] = useState(0);

  useEffect(() => {
    getData()
  });

  async function getData() {
    const accounts = await web3.eth.getAccounts();

    const schedule = await token.methods.schedules(accounts[0], scheduleID).call();
    const numSchedules = await token.methods.numberOfSchedules(accounts[0]).call();
    setNumberOfSchedules(numSchedules);

    setTotalAmount(web3.utils.fromWei(schedule.totalAmount));
    setClaimedAmount(web3.utils.fromWei(schedule.claimedAmount));

    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setCliffTime(schedule.cliffTime);

    setStartTimeDisplay(moment(startTime * 1000).format("D MMMM YYYY, h:mm a"));
    setEndTimeDisplay(moment(endTime * 1000).format("D MMMM YYYY, h:mm a"));
    setCliffTimeDisplay(moment(cliffTime * 1000).format("D MMMM YYYY, h:mm a"));
    setTimeTilCliff(moment(cliffTime * 1000).diff(moment(startTime * 1000), 'days'));

    setLoading(false);
  }

  async function claimTokens() {
    const Web3 = require('web3');
    const web3 = new Web3(Web3.givenProvider);
    const token = new web3.eth.Contract(TokenVesting.abi, contractAddress);

    const accounts = await web3.eth.getAccounts();

    token.methods.claim(scheduleID).send({ from: accounts[0] })
  }

  const chartData = () => {
    return {
      datasets: [
        {
          data: getPoints(),
          borderColor: '#000',
          pointBackgroundColor: '#000',
          pointRadius: 10
        }
      ],
    }
  }

  const getPoints = () => {
    const current = new Date() / 1000

    const points = [ getPointAtTime(startTime) ]

    if (cliffTime < current) {
      points.push(getPointAtTime(cliffTime))
    }

    if (startTime < current && current < endTime) {
      points.push(getPointAtTime(current))
    }

    if (cliffTime > current) {
      points.push(getPointAtTime(cliffTime))
    }

    points.push(getPointAtTime(endTime))

    return points
  }

  const getPointAtTime = (time) => {
    return {
      x: moment(time * 1000).format('MM/DD/YYYY HH:mm'),
      y: totalAmount * (time - startTime) / (endTime - startTime)
    }
  }

  const chartOptions = () => {
    return {
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              format: 'MM/DD/YYYY HH:mm',
              tooltipFormat: 'll HH:mm'
            },
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: 'Amount'
            }
          }
        ]
      },
    }
  }

  const arrayScheduleID = new Array(Number(numberOfSchedules));

  for(let i = 0; i < arrayScheduleID.length; i++){
    arrayScheduleID[i] = i;
  }

  return (
    <>
      {loading ? <Loading /> : null}

      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <Button variant="outline-secondary" href='/'><Icons.IoHome /></Button>{' '}

        <Dropdown>
          <Dropdown.Toggle variant="outline-primary">Select Vesting Schedule </Dropdown.Toggle>
          <Dropdown.Menu>
            {arrayScheduleID.map(id => <Dropdown.Item href={'/' + contractAddress + '/' + id}>Schedule Number {id + 1}</Dropdown.Item>)}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Table striped bordered>
        <tbody>

          <TableRow title="Contract address">
            <a href={ `https://etherscan.io/address/${contractAddress}` } target="_blank" rel="noreferrer">
              { contractAddress }
            </a>
          </TableRow>

          <TableRow title="Schedule Number">
            { scheduleID + 1 }
          </TableRow>

          <TableRow title="Total amount">
            { totalAmount }
          </TableRow>

          <TableRow title="Claimed amount">
            { Math.round(claimedAmount) } (rounded to ether)
          </TableRow>

          <TableRow title="Start time">
            { startTimeDisplay }
          </TableRow>

          <TableRow title="End time">
            { endTimeDisplay }
          </TableRow>

          <TableRow title="Cliff time">
            { cliffTimeDisplay }
          </TableRow>

          <TableRow title="Time til cliff">
            { timeTilCliff } { timeTilCliff <= 1 ? 'day' : 'days' }
          </TableRow>

        </tbody>
      </Table>

      <Line data={ chartData } options={ chartOptions() } />

      <div style={{display: 'flex', justifyContent: 'center', marginTop: '2vh', marginBottom: '4vh'}}>
        <Button variant="primary" size="lg" onClick={() => claimTokens()}>
          Claim Vested Tokens
        </Button>{' '}
      </div>

    </>
  );
};

export default VestingUI;
